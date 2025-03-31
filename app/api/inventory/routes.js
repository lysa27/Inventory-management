import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Inventory from "@/models/Inventory";

export async function GET() {
  await connectDB();
  const items = await Inventory.find();
  return NextResponse.json(items);
}

export async function POST(req) {
  await connectDB();
  const { name, category, quantity, status } = await req.json();
  const newItem = await Inventory.create({ name, category, quantity, status });
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req) {
  await connectDB();
  const { id, ...updateData } = await req.json();
  const updatedItem = await Inventory.findByIdAndUpdate(id, updateData, { new: true });
  return NextResponse.json(updatedItem);
}

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();
  await Inventory.findByIdAndDelete(id);
  return NextResponse.json({ message: "Item deleted" });
}
