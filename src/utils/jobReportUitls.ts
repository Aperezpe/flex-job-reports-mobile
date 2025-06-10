import { Alert } from "react-native";
import { callGemini } from "../config/geminiService";
import { AppError } from "../types/Errors";
import { FormField } from "../types/SystemForm";
import { formatDate } from "./date";
import { getStoragePath } from "./supabaseUtils";
import { supabaseUrl } from "../config/supabase";

export const formatJobReportToHtml = (
  report: Record<string, any>,
  summary: string | null = null
): string => {
  const sectionToHtml = (section: any) => {
    const rows = section.fields
      .map((field: any) => {
        let value = field.value;

        // Format dates
        if (
          typeof value === "string" &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)
        ) {
          value = formatDate(new Date(value));
        }

        // Handle image arrays
        if (Array.isArray(value)) {
          value = value
            .map(
              (url) =>
                `<img src="${url}" style="max-width: 300px; border-radius: 6px; margin: 10px 0;" />`
            )
            .join("");
        }

        return `
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #ccc; background-color: #f9f9f9;">
            <strong>${field.name}</strong>
          </td>
          <td style="padding: 8px 12px; border: 1px solid #ccc;">${value}</td>
        </tr>
      `;
      })
      .join("");

    return `
      <h2 style="font-family: sans-serif; margin-top: 40px; color: #333;">${section.sectionName}</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-family: sans-serif; font-size: 14px;">
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  };

  const bodyContent = report.map(sectionToHtml).join("");

  const smartSummary = !summary
    ? ""
    : `
    <div style="background-color: #eef6fb; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin-bottom: 30px;">
      <h3 style="margin-top: 0; margin-bottom: 8px;">🔍 Summary</h3>
      <p style="margin: 0; line-height: 1.6;">${summary}</p>
    </div>
  `;

  return `
    <html>
      <body style="font-family: sans-serif; padding: 24px; background-color: #f4f4f4; color: #222;">
        <div style="max-width: 800px; margin: auto; background: #fff; padding: 32px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          <h1 style="font-size: 24px; margin-bottom: 20px;">📋 Job Report</h1>
          ${smartSummary}
          ${bodyContent}
        </div>
      </body>
    </html>
  `;
};

export const summarizeJobReportWithAI = async (
  jobReportJson: Record<string, any>,
  accessToken: string | undefined
) => {
  const prompt = `Create a short paragraph of about 2-5 lines summarizing the highlights of the job report:\n\n${JSON.stringify(
    jobReportJson,
    null,
    2
  )}`;

  try {
    const summary = await callGemini(prompt, accessToken);
    console.log("Summary:", summary);
    return summary;
  } catch (err) {
    console.error("Error generating summary:", err);
    return "Failed to generate summary.";
  }
};


export const handleImageUploads = async ({
  data,
  field,
  newJobReportId,
  companyId,
}: {
  data: any;
  field: FormField;
  newJobReportId: string;
  companyId: string | undefined;
}) => {
  try {
    const localURIs = Array.isArray(data[field.id.toString()])
      ? [...(data[field.id.toString()] as string[])]
      : [];

    // Upload images to Supabase and get public URIs
    const imagePaths = await Promise.all(
      localURIs.map((imageUri) =>
        getStoragePath(`${companyId}/${imageUri}`, newJobReportId)
      )
    );

    // Check if any image upload failed
    if (imagePaths.some((path) => !path)) {
      throw new Error("One or more image uploads failed.");
    }

    // Replace the current URIs with the uploaded public URIs
    data[field.id.toString()] = imagePaths;
  } catch (error) {
    console.error("Error handling image uploads:", error);
    throw new AppError(
      "Image Upload Error",
      (error as Error).message || "Failed to upload images"
    );
  }
};

export const sendJobReportEmail = async (
  reportJson: Record<string, any>,
  to: string,
  smartEmailSummaryEnabled: boolean,
  accessToken: string | undefined,
) => {
  try {
    const smartSummary = smartEmailSummaryEnabled
      ? await summarizeJobReportWithAI(reportJson, accessToken)
      : null;

    const html = formatJobReportToHtml(reportJson, smartSummary);

    const res = await fetch(
      `${supabaseUrl}/functions/v1/send-job-report-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          to,
          subject: "New Job Report Submitted",
          html,
        }),
      }
    );

    const data = await res.json();

    if (!data?.id && data?.statusCode !== 200) {
      throw new AppError(
        data.name || "Failed to send email",
        data.message || JSON.stringify(data)
      );
    }

    Alert.alert("Success", "Job report emailed successfully!");
    return data;
  } catch (error) {
    console.error("Error sending job report email:", error);
    throw new AppError(
      "Failed to send job report email",
      (error as Error).message || "Unknown error"
    );
  }
};

/**
* Converts a Date object to an ISO string format.
* If the input is invalid or undefined, returns an empty string.
*
* @param date - The Date object to convert.
* @returns {string} - The ISO string representation of the date or an empty string.
*/
export const convertDateToISO = (date: Date | undefined): string => {
  return date ? date.toISOString() : "";
};