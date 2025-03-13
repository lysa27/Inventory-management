import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAuthenticated, createSystemLog } from "@/lib/auth";

// Get, update, or delete a specific person
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const id = params.id;
      
      const person = await prisma.person.findUnique({
        where: { id },
        include: {
          borrowings: {
            include: {
              item: true,
            },
            orderBy: {
              borrowDate: 'desc',
            },
          },
        },
      });
      
      if (!person) {
        return NextResponse.json(
          { message: "Person not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(person);
    } catch (error) {
      console.error("Error fetching person details:", error);
      return NextResponse.json(
        { message: "Failed to fetch person details" },
        { status: 500 }
      );
    }
  }
  
  export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { isAuth, user } = await isAuthenticated(request);
      
      if (!isAuth || user?.role !== "INVENTORY_MANAGER") {
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: 403 }
        );
      }
      
      const id = params.id;
      const { 
        fullName, 
        email, 
        phoneNumber, 
        residence,
        assurerName,
        assurerContact
      } = await request.json();
      
      // Check if person exists
      const existingPerson = await prisma.person.findUnique({
        where: { id },
      });
      
      if (!existingPerson) {
        return NextResponse.json(
          { message: "Person not found" },
          { status: 404 }
        );
      }
      
      // Update person
      const updatedPerson = await prisma.person.update({
        where: { id },
        data: {
          fullName: fullName || undefined,
          email: email || undefined,
          phoneNumber: phoneNumber || undefined,
          residence: residence || undefined,
          assurerName: assurerName !== undefined ? assurerName : undefined,
          assurerContact: assurerContact !== undefined ? assurerContact : undefined,
        },
      });
      
      // Log the action
      await createSystemLog(
        user.userId, 
        `Updated person: ${updatedPerson.fullName}`
      );
      
      return NextResponse.json(updatedPerson);
    } catch (error) {
      console.error("Error updating person:", error);
      return NextResponse.json(
        { message: "Failed to update person" },
        { status: 500 }
      );
    }
  }