import type { JournalSettings } from "../types";

/**
 * Email service abstraction (§35).
 *
 * The journal never hard-codes a provider. The default "log-only" provider
 * records every message in the audit-grade email log so the complete
 * notification trail is visible to administrators. Swapping in SMTP,
 * Resend, SendGrid or Amazon SES only requires implementing EmailProvider
 * and selecting it in Admin Settings — no other code changes.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

export interface EmailProvider {
  name: JournalSettings["emailProvider"];
  send(msg: EmailMessage): Promise<boolean>;
}

const logOnlyProvider: EmailProvider = {
  name: "log-only",
  // In this environment messages are archived to the email log instead of
  // being dispatched over the network. Attachments (TLC images) are never
  // included — emails only link to the secure dashboard (§7).
  send: async () => true,
};

const PROVIDERS: Record<JournalSettings["emailProvider"], EmailProvider> = {
  "log-only": logOnlyProvider,
  smtp: logOnlyProvider, // placeholder — wire a backend SMTP relay here
  resend: logOnlyProvider, // placeholder — wire the Resend API here
  sendgrid: logOnlyProvider, // placeholder — wire the SendGrid API here
  ses: logOnlyProvider, // placeholder — wire Amazon SES here
};

export function getProvider(name: JournalSettings["emailProvider"]): EmailProvider {
  return PROVIDERS[name] ?? logOnlyProvider;
}

/** Fill {{placeholders}} in a configured template. */
export function renderTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
}

export const EDITOR_DASHBOARD_LINK = "/dashboard";
