import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Transaction {
  transaction_date: string;
  category_id: null;
  sub_category_id: null;
  transaction_name: string;
  amount: number;
  currency_id: number;
  seller_name: null;
  discount_amount: null;
  discount_origin: null;
  comments: null;
  user_id: string;
  transaction_type: number;
  is_income: number;
  created_at: string;
  updated_at: string;
  code?: string;
}

function cleanGPTResponse(text: string): string {
  // Remove markdown code block syntax if present
  let cleaned = text
    .replace(/```json\n?/g, '')  // Remove opening ```json
    .replace(/```\n?/g, '')      // Remove closing ```
    .replace(/"current ISO timestamp"/g, `"${new Date().toISOString()}"`) // Replace timestamp placeholder
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\r/g, '') // Remove carriage returns
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim(); // Remove any extra whitespace

  // Ensure the response is a complete JSON array
  if (!cleaned.startsWith('[')) {
    cleaned = '[' + cleaned;
  }
  if (!cleaned.endsWith(']')) {
    cleaned = cleaned + ']';
  }

  // Fix any incomplete objects at the end
  const lastBraceIndex = cleaned.lastIndexOf('}');
  if (lastBraceIndex !== -1) {
    cleaned = cleaned.substring(0, lastBraceIndex + 1) + ']';
  }

  return cleaned;
}

export async function formatTransactionsWithGPT(
  text: string,
  currency_id: number,
  user_id: string,
  monthly_start_date: number
): Promise<Transaction[]> {
  try {
    const prompt = `You are a JSON-generating financial data parser.

        Given the following raw bank transaction text, convert it into an array of TypeScript objects conforming to the following 'Transaction' interface:

        export interface Transaction {
        transaction_date: string;
        category_id: null;
        sub_category_id: null;
        transaction_name: string;
        amount: number;
        currency_id: number;
        seller_name: null;
        discount_amount: null;
        discount_origin: null;
        comments: null;
        user_id: string;
        transaction_type: number;
        is_income: number;
        created_at: string;
        updated_at: string;
        code?: string;
        }

        Instructions:
        - Extract transactions from the provided text, but only include transactions from the ${monthly_start_date}th of the month onwards.
        - Use the transaction date as 'transaction_date' in "YYYY-MM-DD" format.
        - For 'transaction_name', extract the meaningful name from the description:
          * For UPI transactions, look for recognizable business names (e.g., "Zomato", "BookMyShow", "Amazon")
          * For NEFT/IMPS, use the recipient's name
          * For other transactions, use the most meaningful part of the description
          * If no clear name is found, use the first meaningful part of the description
        - Use the full original description as 'code'.
        - For 'transaction_type':
          * Use 0 for DR (Debit) transactions
          * Use 1 for CR (Credit) transactions
        - Set 'is_income' to 0.
        - Set currency_id to ${currency_id}.
        - Set user_id to "${user_id}".
        - Use "current ISO timestamp" as a placeholder for 'created_at' and 'updated_at' (it will be replaced with actual timestamps).
        - Return a valid JSON array without any markdown formatting or additional text.
        - Ensure the response is a complete JSON array with proper closing brackets.
        - Only include transactions that occurred on or after the ${monthly_start_date}th of the month.

        Examples of name extraction:
        - "UPI/zomatoonlineord/ZomatoOnline Ord/AIRTEL PAYMENTS/..." -> "Zomato"
        - "UPI/shreyab408-1@ok/UPI/HDFC BANK LTD/..." -> "Shreya"
        - "NEFT-CITIN52025050962150160-TATA CONSULTANCY SERVICES LIMITED-..." -> "TATA CONSULTANCY SERVICES"
        - "UPI/bookmyshow@yesp/BOOKMY SHOW/YesBank_Yespay/..." -> "Book My Show"

        Examples of transaction types:
        - "DR" or "Debit" in description -> transaction_type: 0
        - "CR" or "Credit" in description -> transaction_type: 1

        Here is the raw transaction text:
        ${text}`;
    console.log('Prompt:', prompt);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts and formats bank statement transactions into structured data. Focus on extracting meaningful names from transaction descriptions and correctly identifying DR/CR transactions. Return only the JSON array without any markdown formatting or additional text. Ensure the response is a complete JSON array with proper closing brackets."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4096
    });

    const formattedText = response.choices[0]?.message?.content;
    if (!formattedText) {
      throw new Error('No response from GPT');
    }
    console.log('Formatted text:', formattedText);
    // Clean the response and parse the JSON
    const cleanedText = cleanGPTResponse(formattedText);
    console.log('Cleaned GPT response:', cleanedText); // Debug log

    try {
      const transactions = JSON.parse(cleanedText) as Transaction[];
      return transactions;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Failed to parse text:', cleanedText);
      throw new Error('Failed to parse GPT response as JSON');
    }
  } catch (error) {
    console.error('Error formatting transactions with GPT:', error);
    throw new Error('Failed to format transactions');
  }
}