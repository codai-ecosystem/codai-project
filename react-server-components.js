// React Server Components Implementation
import { NextRequest, NextResponse } from 'next/server';

export async function ServerDataComponent({ params }) {
  const data = await fetchDataFromAPI(params.id);
  
  return (
    <div className="server-component">
      <h1>Server Rendered: {data.title}</h1>
      <p>Fetched on server: {new Date().toISOString()}</p>
      <ClientComponent initialData={data} />
    </div>
  );
}

async function fetchDataFromAPI(id) {
  await new Promise(resolve => setTimeout(resolve, 100));
  return { id, title: 'Server Data', timestamp: Date.now() };
}
