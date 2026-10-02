import LegalPage from "../components/legal-page";
export const metadata = { title: "Privacy overview" };
export default function Page() {
  return (
    <LegalPage title="PRIVACY OVERVIEW.">
      <h2>IN THIS PREVIEW</h2>
      <p>
        Application drafts are saved in session storage in the current browser
        tab for up to 24 hours and restored after a reload. Completing the preview
        clears the draft. Update-form entries remain in page memory only.
        No preview entries are sent to an organizer or stored in our database.
        Use sample information when exploring.
      </p>
      <p>
        The hosting provider may process ordinary request information to serve
        the website. No marketing analytics or tracking pixels have been enabled
        by this preview.
      </p>
      <h2>PUBLIC AND PRIVATE</h2>
      <p>
        Adult applicants initially see Public selected. They can choose Private.
        A completed application and fighter profile are required for everyone.
        Recording, ownership and use of content are covered by one acceptance of
        the Terms of Participation &amp; Content. Public allows the public uses
        described there; Private restricts publication without changing the
        content ownership model.
      </p>
      <p>
        Private profiles and footage are excluded from public pages. Under-18
        profiles remain private. Shared identifiable footage stays unpublished
        if either participant is Private. Both participants must have accepted
        the applicable Terms before a Public / Public pair can be considered for
        publication.
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
