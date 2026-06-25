import {
  buildReceiptDocument,
  buildReceiptHtml,
  type ReceiptTransaction,
} from "@susuflow/shared/client";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

function sanitizeFilename(reference: string): string {
  return reference.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 64);
}

async function createReceiptPdfUri(
  transaction: ReceiptTransaction,
  options: { companyName: string; webOrigin: string },
): Promise<string> {
  const document = buildReceiptDocument(transaction, options);
  const html = buildReceiptHtml(document);
  const { uri: tempUri } = await Print.printToFileAsync({ html });

  const baseDir = FileSystem.cacheDirectory;
  if (!baseDir) {
    throw new Error("File storage is not available on this device");
  }

  const filename = `receipt-${sanitizeFilename(transaction.reference)}.pdf`;
  const destination = `${baseDir}${filename}`;

  await FileSystem.deleteAsync(destination, { idempotent: true });
  await FileSystem.moveAsync({ from: tempUri, to: destination });

  return destination;
}

export async function downloadReceiptFile(
  transaction: ReceiptTransaction,
  options: { companyName: string; webOrigin: string },
): Promise<void> {
  const uri = await createReceiptPdfUri(transaction, options);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: "Save receipt",
    UTI: "com.adobe.pdf",
  });
}

export async function shareReceiptFile(
  transaction: ReceiptTransaction,
  options: { companyName: string; webOrigin: string },
): Promise<void> {
  const uri = await createReceiptPdfUri(transaction, options);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: "Share receipt",
    UTI: "com.adobe.pdf",
  });
}
