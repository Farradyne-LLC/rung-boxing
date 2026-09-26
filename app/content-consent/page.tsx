import LegalPage from "../components/legal-page";
export const metadata = { title: "Content consent overview" };
export default function Page() {
  return (
    <LegalPage title="YOUR CONTENT. YOUR CHOICES.">
      <h2>SEPARATE FROM PARTICIPATION</h2>
      <p>
        Content permissions are separate from the participation agreement.
        Buying content is optional. A Public visibility preference does not
        authorize recording, advertising or publication by itself.
      </p>
      <h2>INDIVIDUAL CHOICES</h2>
      <ul>
        <li>Recording and editing.</li>
        <li>Public website profile.</li>
        <li>Website footage.</li>
        <li>Social media.</li>
        <li>YouTube.</li>
        <li>Punch Mentality advertising.</li>
        <li>Partner gym use, where specifically agreed.</li>
      </ul>
      <p>
        Permissions start unchecked in the preview. The live system must record
        the selected categories, timestamp and agreement version. Demo choices
        do not constitute a signed release.
      </p>
      <h2>BOTH FIGHTERS MATTER</h2>
      <p>
        Shared footage is not automatically published. The required permissions
        from both participants must be checked for the proposed use. A Public /
        Private pairing stays unpublished without a separate authorization from
        the private participant.
      </p>
      <h2>YOUTH AND PRIVATE MATERIAL</h2>
      <p>
        Youth profiles remain private until a separately approved guardian
        procedure is in place. Private profile and footage access must be
        protected in the live product.
      </p>
      <h2>BEFORE CONTENT IS SHARED</h2>
      <p>
        Final wording, the duration and scope of permissions, partner-gym use,
        changes to choices and removal procedures must be confirmed before real
        materials are published. This draft does not add AI analysis or
        model-training consent.
      </p>
    </LegalPage>
  );
}
