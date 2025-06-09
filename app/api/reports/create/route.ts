import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ReportType } from "@prisma/client";
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: "gmail", // use the 'service' shortcut
  auth: {
    user: "crimereporting78@gmail.com",
    pass: "fvod ankl rvsn cfvu", // app-specific password
  },
});


async function sendAdminNotification(report: any) {
  const emailContent = {
    from: 'crimereporting78@gmail.com',
    to: 'vishnupradeep848@gmail.com',
    subject: `New Report Submitted - ${report.type}`,
    html: `
      <h2>New Report Notification</h2>
      <p><strong>Report ID:</strong> ${report.reportId}</p>
      <p><strong>Type:</strong> ${report.type}</p>
      <p><strong>Specific Type:</strong> ${report.reportType}</p>
      <p><strong>Title:</strong> ${report.title}</p>
      <p><strong>Description:</strong> ${report.description}</p>
      <p><strong>Location:</strong> ${report.location}</p>
      ${report.latitude && report.longitude ? 
        `<p><strong>Coordinates:</strong> ${report.latitude}, ${report.longitude}</p>` : 
        ''
      }
      <p><strong>Status:</strong> ${report.status}</p>
      <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
    `,
  };

  try {
    // Using Nodemailer
    await transporter.sendMail(emailContent);
    
    // Alternative: Using Resend
    // await resend.emails.send(emailContent);
    
    console.log('Admin notification email sent successfully');
  } catch (emailError) {
    console.error('Failed to send admin notification email:', emailError);
    // Don't throw error here to avoid breaking the main flow
  }
}


export async function POST(request: Request) {
  try {
    const {
      reportId,
      type,
      specificType,
      title,
      description,
      location,
      latitude,
      longitude,
      image,
      status,
    } = await request.json();

    const report = await prisma.report.create({
      data: {
        reportId,
        type: type as ReportType,
        title,
        description,
        reportType: specificType,
        location,
        latitude: latitude || null,
        longitude: longitude || null,
        image: image || null,
        status: status || "PENDING",
      },
    });
     await sendAdminNotification(report);
    return NextResponse.json({
      success: true,
      reportId: report.reportId,
      message: "Report submitted successfully",
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit report",
      },
      { status: 500 }
    );
  }
}
