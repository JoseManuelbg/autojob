import { NextRequest, NextResponse } from "next/server";
import { leerAjustes, guardarAjustes } from "@/lib/ajustes";

export async function GET() {
  return NextResponse.json(leerAjustes());
}

export async function PUT(req: NextRequest) {
  const datos = await req.json();
  return NextResponse.json(guardarAjustes(datos));
}
