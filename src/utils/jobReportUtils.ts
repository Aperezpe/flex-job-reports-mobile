import { Alert, Platform } from "react-native";
import { callGemini } from "../config/geminiService";
import { AppError } from "../types/Errors";
import { FormSection } from "../types/SystemForm";
import { formatDate } from "./date";
import { supabaseUrl } from "../config/supabase";
import { JobReport, JobReportView, ReportData, ReportField } from "../types/JobReport";
import { TicketData, TicketView } from "../types/Ticket";
import { Address } from "../types/Address";
import { v4 as uuidv4 } from "uuid";
import { System } from "../types/System";
import { SystemType } from "../types/SystemType";

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
export const convertDateToISO = (date?: Date | null): string => {
  return date ? date.toISOString() : "";
};

export const constructTicketData = (ticket: TicketView): TicketView => {
  return {
    ...ticket,
    ticketDate: ticket.ticketDate ? new Date(ticket.ticketDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) : "",
  }
}

export const extractJobReportFields = (jobReport: JobReportView) => {
  const fields = jobReport?.reportData?.[0]?.fields ?? [];

  const getValue = (name: string): string =>
    fields.find((field: any) => field.name === name)?.value ?? "";

  return {
    addressName: getValue("Address Name"),
    systemName: getValue("System Name"),
    streetAddress: getValue("Address"),
    address: jobReport?.address,
    companyId: jobReport?.companyId,
    systemArea: getValue("System Area"),
  };
};


export const getUpdatedTicketInProgress = ({
  ticketInProgress,
  address,
  system,
  cleanedSections,
  formData,
  systemType,
}: {
  ticketInProgress: TicketData,
  address: Address,
  system: System,
  cleanedSections: FormSection[],
  formData: any,
  systemType: SystemType | null,
}): TicketData => {
  // saves the current report in redux state ticketInProgress
  const newJobReportId = uuidv4();
  // const data = watch();

  // Format the report data into sections and fields
  const reportDataWithSection: ReportData[] = cleanedSections.map((section) => ({
    sectionName: section.title || "Unnamed Section",
    fields:
      (section.fields?.map((field) => {
        let fieldValue = formData[field.id.toString()];
        if (field.type === "date") fieldValue = convertDateToISO(fieldValue);
        return {
          id: field.id,
          name: field.title || "Unnamed Field",
          value: fieldValue || "",
        };
      }) ?? []),
  }));

  // Include the "Default Info" fields (id === 0)
  const defaultInfoFields: ReportField[] = [
    { name: "Address", value: address?.addressString || "N/A" },
    { name: "System Type", value: systemType?.systemType || "N/A" },
    { name: "System Area", value: system?.area || "N/A" },
    { name: "System Tonnage", value: system?.tonnage || "N/A" },
  ];

  if (reportDataWithSection.length > 0) {
    reportDataWithSection[0].fields?.unshift(...defaultInfoFields);
  }

  const newJobReport: JobReport = {
    id: newJobReportId,
    systemId: system.id!,
    reportData: reportDataWithSection,
  };

  const updatedJobReports = [...ticketInProgress.jobReports];

  const existingReportIndex = ticketInProgress.jobReports.findIndex(
    (report) => report.systemId === system.id
  );
  const reportExists = existingReportIndex !== -1;

  if (reportExists) {
    updatedJobReports[existingReportIndex] = newJobReport;
  } else {
    updatedJobReports.push(newJobReport);
  }

  return {
    ...ticketInProgress,
    jobReports: updatedJobReports,
  };
};


export const isLocalFileUri = (uri: string): boolean => {
  if (typeof uri !== 'string') return false
  if (Platform.OS === 'android') {
    return uri.startsWith('file://') || uri.startsWith('content://');
  } else if (Platform.OS === 'ios') {
    return uri.startsWith('file://') || uri.startsWith('assets-library://');
  }
  return false;
}