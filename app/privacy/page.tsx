import LegalPage from "../components/legal-page";
export const metadata = { title: "Privacy overview" };
export default function Page() {
  return (
    <LegalPage title="PRIVACY OVERVIEW.">
      <h2>IN THIS PREVIEW</h2>
      <p>
        Application and update-form entries remain only in the current page’s
        memory. They are not sent to an organizer, stored in a database or saved
        to browser storage. Leaving or refreshing the page clears them. Use
        sample information when exploring.
      </p>
      <p>
        The hosting provider may process ordinary request information to serve
        the website. No marketing analytics or tracking pixels have been enabled
        by this preview.
      </p>
      <h2>PUBLIC AND PRIVATE</h2>
      <p>
        Adult applicants initially see Public selected. They can choose Private.
        Public is a visibility preference, not a publication release. Separate
        permissions are needed for approved profile information and each use of
        footage.
      </p>
      <p>
        Private profiles and footage are excluded from public pages. Under-18
        profiles remain private. Shared footage needs appropriate permission
        from both participants.
      </p>
      <h2>BEFORE LIVE REGISTRATION</h2>
      <p>
        The final policy must identify the operator, contact method, data
        collected, purposes, retention periods, service providers, access
        controls and process for privacy requests. Private footage requires
        authenticated access or an equivalently protected delivery method.
      </p>
      <p>
        Publication changes and removal requests need an established process
        before real content is made public. This page does not promise that
        already shared copies can be recalled.
      </p>
    </LegalPage>
  );
}
