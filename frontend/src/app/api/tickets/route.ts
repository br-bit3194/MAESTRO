import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the schema for the request body
const ticketSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validation = ticketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { description, priority } = validation.data;
    
    // Call the Python backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        priority,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData: { detail: string } = await response.json();
      throw new Error(errorData.detail || 'Failed to process ticket');
    }

    const data: any = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error processing ticket:', error);
    return NextResponse.json(
      { error: 'Failed to process ticket', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Call the Python backend API to get all tickets
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/tickets`);

    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets', details: error.message },
      { status: 500 }
    );
  }
}
