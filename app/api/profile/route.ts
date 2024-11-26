import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { ProfileService } from "@/lib/services/profile-service"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const profile = await ProfileService.getProfile(session.user.id)
    
    if (!profile) {
      return NextResponse.json({}, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    
    // Basic validation
    if (!body.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const profile = await ProfileService.updateProfile(session.user.id, body)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await ProfileService.deleteProfile(session.user.id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Profile deletion error:', error)
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    )
  }
}