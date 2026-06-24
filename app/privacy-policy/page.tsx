import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Aero Aviation",
  description:
    "Aero Aviation privacy policy and data protection framework for aeroaviation.me.",
}

type Subsection = {
  title: string
  paragraphs: string[]
}

type PolicySection = {
  id: string
  number: string
  title: string
  paragraphs?: string[]
  subsections?: Subsection[]
}

const sections: PolicySection[] = [
  {
    id: "introduction",
    number: "01",
    title: "Introduction",
    paragraphs: [
      "Aero Aviation values the trust placed in our organisation by every visitor, client, operator, and partner who engages with us through aeroaviation.me. This Privacy Policy explains in detail how we collect, use, store, share, and safeguard information when you interact with our website, our flight operations services, our dispatch desk, and the Flight Core Intelligence platform that we develop and maintain. It also sets out the rights available to you under the privacy laws that apply to our operations in the jurisdictions where we conduct business.",
      "Aero Aviation operates as a division of Aviate Pro ME LLC Group, a multinational aviation services enterprise with offices in Islamabad, Doha, Sherman Oaks in California, and Glasgow. The Group serves civil aviation authorities, scheduled and charter operators, MEDEVAC mission coordinators, training institutions, and corporate clients across multiple continents, and the integrity of every information flow within our ecosystem is treated as a foundational obligation of our business.",
      "By accessing aeroaviation.me, by submitting any enquiry through our contact channels, by subscribing to our intelligence briefings, or by entering into a commercial engagement with us, you acknowledge that you have read and understood the terms of this Privacy Policy. If you do not agree with any part of this document, we ask that you refrain from using our website or providing personal information to us.",
    ],
  },
  {
    id: "who-we-are",
    number: "02",
    title: "Who We Are",
    paragraphs: [
      "Aero Aviation is the flight operations and dispatch division of Aviate Pro ME LLC Group. We are responsible for live flight following, dispatch release coordination, regulatory liaison, weather and route intelligence, and the design and operation of the Flight Core Intelligence platform that serves aviation operators in real time conditions. Our parent entity, Aviate Pro ME LLC Group, is the controller of personal data collected through aeroaviation.me, and our internal Legal and Compliance Department oversees data governance across the four office locations identified above.",
      "Any reference within this policy to \"we\", \"our\", or \"us\" should be understood to mean Aero Aviation and, where relevant, the parent entity Aviate Pro ME LLC Group. References to \"you\" or \"your\" describe any natural person whose personal data is processed by us in connection with our website or services.",
    ],
  },
  {
    id: "information-we-collect",
    number: "03",
    title: "Categories of Information We Collect",
    paragraphs: [
      "We collect information in several different categories depending on the nature of your interaction with us. We collect only what is required for legitimate operational, contractual, regulatory, or commercial purposes, and we do not pursue speculative or excessive data gathering.",
      "The first category covers identification and contact information that you provide voluntarily. This includes your full name, professional title, employer or operator name, postal address, telephone numbers, electronic mail address, and any other contact particulars that you choose to share when you submit a form, request a quotation, register for an intelligence briefing, apply for a training place, or correspond with our offices.",
      "The second category covers professional and aviation specific information that supports the services we deliver. This includes pilot licence references, dispatcher certifications, type ratings, medical certificate expiry dates where you supply them, operator certificates, fleet details, aircraft registration markings, and other information necessary for crew scheduling, dispatch coordination, training placement, or compliance verification.",
      "The third category covers technical information that is collected automatically when you visit aeroaviation.me. This includes your internet protocol address, the type and version of browser you use, device and operating system identifiers, screen resolution, language preferences, referring page, time of visit, duration of session, and the pages or assets accessed during your visit.",
      "The fourth category covers transactional and commercial information. Where you engage with us as a paying client or partner, we collect billing details, purchase order references, banking particulars provided to us for the purpose of issuing payments or receipts, contract identifiers, and correspondence relating to invoicing or commercial settlement.",
      "The fifth category covers information generated through the operation of the Flight Core Intelligence platform. When authorised users access FCI, we collect login identifiers, role assignments, query history, exported report metadata, and audit trail entries that record interactions with restricted or controlled data sets. We treat platform usage data as confidential operational information and apply strict access controls to it.",
      "The sixth category covers any sensitive information that you elect to share with us. We discourage the unsolicited transmission of sensitive personal data, but where such data is provided to us for a legitimate purpose, including for example medical certificate references or background screening documentation submitted in connection with crew onboarding, we apply heightened safeguards in keeping with the laws of the jurisdiction in which the data was collected.",
    ],
  },
  {
    id: "collection-methods",
    number: "04",
    title: "How We Collect Information",
    paragraphs: [
      "We collect information through multiple channels. Most personal data reaches us directly from you when you complete a form on aeroaviation.me, when you send correspondence to one of our office locations, when you engage with a member of our Legal and Compliance, Flight Operations, or Business Development teams, or when you participate in an event hosted by Aviate Pro ME LLC Group or one of its divisions.",
      "We also collect information automatically when you browse our website. Cookies, server logs, and similar technologies record technical attributes of your visit and assist us in maintaining the security, performance, and analytical integrity of our digital properties. The detail of our use of cookies is set out in Section 11 of this policy.",
      "In limited circumstances, we receive personal data from third parties. These include civil aviation regulators where the lawful exchange of pilot or dispatcher records is required, training partners and authorised representatives who share candidate information for course placement, payment processors who confirm transactional information, and reputable open source aviation intelligence providers from whom we ingest flight tracking and operational data into the Flight Core Intelligence platform.",
    ],
  },
  {
    id: "processing-purposes",
    number: "05",
    title: "Purposes of Processing",
    paragraphs: [
      "We process personal data only where a clearly identifiable and legitimate purpose exists. The principal purposes are summarised in the paragraphs that follow.",
      "We process information in order to operate and maintain aeroaviation.me, to ensure the technical integrity of our digital infrastructure, to defend our systems against intrusion or abuse, and to improve the design and functionality of our online services.",
      "We process information in order to respond to enquiries that you address to us, to provide quotations, to enter into and perform contracts, to coordinate flight dispatch and operational matters, to maintain client and operator records, to deliver the Flight Core Intelligence platform to authorised users, and to issue regulatory or commercial correspondence.",
      "We process information in order to comply with applicable legal, regulatory, and aviation safety obligations. These include obligations imposed by civil aviation authorities, taxation authorities, anti money laundering frameworks, sanctions regimes, and corporate governance regulators in the jurisdictions where we operate.",
      "We process information in order to communicate with you about products, services, intelligence briefings, training opportunities, and corporate updates that we believe may be of professional interest. Where the law requires it, we obtain your consent before sending such communications, and we always provide a clear method to withdraw consent.",
      "We process information in order to safeguard the security of our personnel, the integrity of our operational data, and the lawful rights and interests of Aviate Pro ME LLC Group. This includes investigation of suspected misconduct, breach response, evidence preservation, and cooperation with law enforcement agencies where lawful and appropriate.",
      "We process information in order to support internal record keeping, financial accounting, internal audit, group level reporting, and the production of aggregate and statistical analyses that inform our strategic and operational decisions.",
    ],
  },
  {
    id: "legal-bases",
    number: "06",
    title: "Legal Bases for Processing",
    paragraphs: [
      "Because Aviate Pro ME LLC Group operates across multiple legal jurisdictions, we rely on different legal bases depending on the territory in which the data subject is located and the nature of the processing concerned.",
    ],
    subsections: [
      {
        title: "6.1 United Kingdom and European Economic Area",
        paragraphs: [
          "Where the United Kingdom General Data Protection Regulation, the European Union General Data Protection Regulation, or substantially equivalent regional frameworks apply, we rely on one or more of the following legal bases. The performance of a contract with you or the taking of pre contractual steps at your request. Compliance with a legal obligation to which we are subject. The protection of vital interests of yourself or another natural person in exceptional circumstances. The pursuit of our legitimate interests as a multinational aviation enterprise, balanced against your fundamental rights and freedoms. The consent that you provide for specific processing activities, which you may withdraw at any time without affecting the lawfulness of processing carried out before the withdrawal.",
        ],
      },
      {
        title: "6.2 California",
        paragraphs: [
          "Where California privacy law applies, we collect, retain, and disclose personal information only for the business and commercial purposes disclosed in this policy and only for purposes that are reasonably necessary and proportionate to those disclosed.",
        ],
      },
      {
        title: "6.3 Pakistan, Qatar, and Other Jurisdictions",
        paragraphs: [
          "Where the data protection laws of Pakistan, Qatar, or any other jurisdiction in which we operate apply, we comply with all applicable statutory requirements, including those relating to lawful basis, transparency, data subject rights, and cross border data transfer.",
        ],
      },
    ],
  },
  {
    id: "sharing",
    number: "07",
    title: "Sharing of Information",
    paragraphs: [
      "We do not sell personal data. We share personal data only where it is necessary to deliver our services, to comply with legal obligations, or to protect the legitimate interests of our clients, our partners, or our Group.",
      "Personal data may be shared with affiliated entities within Aviate Pro ME LLC Group, including Aviate Pro ME LLC, Aero Aviation, and Aviate Pakistan, for the purposes of integrated service delivery, internal administration, group level reporting, and consistent enforcement of compliance standards across our offices.",
      "Personal data may be shared with carefully selected service providers that perform functions on our behalf. These include information technology infrastructure providers, cloud hosting providers, communications platforms, payment processors, professional advisers, auditors, insurers, and specialised aviation data providers. Each such service provider is engaged under a written agreement that imposes confidentiality, security, and lawful processing obligations consistent with the requirements of this policy.",
      "Personal data may be shared with regulators, civil aviation authorities, law enforcement agencies, courts, tribunals, and other public bodies where we are legally required to do so, where the disclosure is necessary to defend or assert legal rights, or where the disclosure is necessary to protect the safety of aviation operations or of identifiable persons.",
      "Personal data may be shared with successors in interest in the event of a corporate restructuring, merger, acquisition, divestiture, or financing transaction involving Aviate Pro ME LLC Group or any of its divisions. In such cases, we apply appropriate contractual safeguards to ensure that the recipient continues to honour the commitments set out in this policy.",
    ],
  },
  {
    id: "international-transfers",
    number: "08",
    title: "International Transfers",
    paragraphs: [
      "Because we operate across four office locations spanning the United Kingdom, the United States, Pakistan, and the State of Qatar, the routine performance of our services involves the transfer of personal data across international borders. We recognise that such transfers attract heightened scrutiny under several major data protection frameworks, and we apply the safeguards required by each applicable law.",
      "Where personal data originating in the United Kingdom, the European Economic Area, or another jurisdiction that imposes specific cross border transfer requirements is moved to a country that has not been recognised as offering an equivalent level of protection, we rely on lawful transfer mechanisms. These include the standard contractual clauses approved by the United Kingdom Information Commissioner's Office or the European Commission as appropriate, supplementary technical and organisational measures, and binding internal commitments enforced across all Group entities.",
      "We maintain a continuing internal review of our cross border data flows to ensure that our practices remain aligned with the evolving regulatory environment.",
    ],
  },
  {
    id: "retention",
    number: "09",
    title: "Data Retention",
    paragraphs: [
      "We retain personal data only for as long as is necessary to achieve the purposes for which it was collected, to comply with our legal and regulatory obligations, to defend or pursue legal claims, or to maintain the historical and operational integrity of our records.",
      "Retention periods vary by category. Contact information submitted through general website enquiries is typically retained for a period of up to twenty four months from the date of last interaction, unless a longer retention period is required by law or is necessary to support an ongoing commercial relationship. Client and operator records are retained for the duration of the contractual relationship and for an additional period thereafter that reflects the statute of limitations applicable in the relevant jurisdiction, together with any sectoral retention requirements imposed by aviation regulators or taxation authorities. Financial and accounting records are retained for the minimum periods required by the laws of the jurisdictions in which the relevant transactions were recognised. Audit logs associated with the Flight Core Intelligence platform are retained for as long as is necessary to support security investigations, operational quality reviews, and regulatory cooperation, with periodic review of continuing necessity.",
      "When personal data is no longer required, we securely delete it, irreversibly anonymise it, or restrict its further processing in accordance with our internal data lifecycle procedures.",
    ],
  },
  {
    id: "your-rights",
    number: "10",
    title: "Your Rights",
    paragraphs: [
      "Depending on the jurisdiction in which you are located, you may have specific rights in respect of the personal data that we hold about you. We honour these rights in accordance with the law that applies to your situation. The rights described below are exercised through the contact channels set out in Section 16 of this policy.",
      "You may request access to the personal data that we hold about you and receive a copy of that data in a structured, commonly used, and machine readable format where the law so provides. You may request correction of any personal data that is inaccurate, incomplete, or out of date. You may request deletion of your personal data where the law permits, subject to our right to retain data that is required for legal, regulatory, contractual, or evidentiary purposes. You may object to certain forms of processing, including processing for direct marketing purposes and processing carried out under the legitimate interests legal basis. You may request restriction of processing in defined circumstances. You may withdraw consent at any time where processing is carried out on the basis of consent, without affecting the lawfulness of processing carried out before withdrawal. You may lodge a complaint with the supervisory authority competent for your jurisdiction if you believe that our processing of your personal data infringes applicable law.",
      "We will respond to your request within the time period required by the relevant law, and in any event without undue delay. We may, where the law permits, ask you to verify your identity before acting on certain requests, in order to protect against fraudulent or mistaken access to personal data.",
    ],
  },
  {
    id: "cookies",
    number: "11",
    title: "Cookies and Tracking Technologies",
    paragraphs: [
      "aeroaviation.me uses cookies and similar technologies to provide essential website functionality, to remember your preferences, to analyse the performance of our site, and to support security monitoring. We classify the technologies we use into several broad groups.",
      "Strictly necessary technologies enable core functions such as session management, form submission, secure authentication, and load balancing. These technologies cannot be disabled without impairing the function of the website. Performance and analytical technologies allow us to understand how visitors engage with the site, which pages attract the most attention, and where technical errors occur. Functional technologies remember language settings, regional preferences, and other choices that improve your experience. Security technologies detect suspicious behaviour, defend against automated abuse, and protect the integrity of our systems.",
      "Where required by the law of your jurisdiction, we obtain your consent before placing non essential cookies and similar technologies on your device, and we provide a clearly accessible mechanism through which you can manage your preferences. You may also manage cookies directly through the settings of your browser, although doing so may affect the function of certain features of the website.",
    ],
  },
  {
    id: "security",
    number: "12",
    title: "Security",
    paragraphs: [
      "Aero Aviation, together with Aviate Pro ME LLC Group, implements administrative, technical, and physical safeguards designed to protect personal data against accidental or unlawful destruction, loss, alteration, unauthorised disclosure, and unauthorised access. Our safeguards include access controls, role based permissioning, encryption in transit and at rest where appropriate, regular security review, secure software development practices, periodic vulnerability scanning, structured incident response procedures, vendor security assessments, and ongoing staff training on information security and data protection.",
      "While we take security with the utmost seriousness, no method of transmission over the internet and no method of electronic storage can be guaranteed to be one hundred percent secure. We therefore cannot warrant the absolute security of any information that you transmit to us, although we make every commercially reasonable effort to protect such information once it reaches our systems.",
      "In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will notify the competent supervisory authority and, where the law so requires, affected data subjects, in accordance with the timelines and content requirements of the relevant law.",
    ],
  },
  {
    id: "children",
    number: "13",
    title: "Children's Privacy",
    paragraphs: [
      "aeroaviation.me is a professional aviation website intended for the use of adults engaged in the aviation industry or in commercial relationships with our Group. We do not knowingly collect personal data from children. If we become aware that personal data relating to a minor has been collected without appropriate authorisation, we will take prompt steps to delete that data from our records.",
    ],
  },
  {
    id: "external-links",
    number: "14",
    title: "Links to External Websites",
    paragraphs: [
      "Our website may contain links to external websites operated by third parties, including regulatory bodies, training partners, intelligence platforms, and professional associations. The inclusion of any such link does not constitute an endorsement of the linked site or its operator. We exercise no control over the privacy practices of third party websites, and this Privacy Policy does not apply to information collected through them. We encourage you to review the privacy statement of any external website before submitting personal data to it.",
    ],
  },
  {
    id: "changes",
    number: "15",
    title: "Changes to This Policy",
    paragraphs: [
      "We may revise this Privacy Policy from time to time to reflect changes in our services, in the applicable law, in our technical infrastructure, or in our internal governance arrangements. The current version of this policy will always be published at aeroaviation.me, and the effective date will be updated to reflect the date on which the revised version takes effect. Where a change is material, we will take additional steps to bring the change to your attention, including by direct notification where the law so requires.",
      "We encourage you to review this Privacy Policy periodically. Your continued use of the website or our services following the publication of an updated policy constitutes acknowledgement of the revised terms.",
    ],
  },
  {
    id: "contact",
    number: "16",
    title: "Contact Information",
    paragraphs: [
      "If you have any question about this Privacy Policy, if you wish to exercise any of the rights described in Section 10, or if you have a concern about the way in which your personal data is handled by us, you are welcome to contact the Legal and Compliance Department of Aviate Pro ME LLC Group at any of the addresses set out below.",
      "We will route your enquiry to the office most appropriate to your jurisdiction and to the nature of your concern, and we will respond within the time period required by the law applicable to your situation.",
    ],
  },
  {
    id: "jurisdictions",
    number: "17",
    title: "Jurisdiction Specific Provisions",
    paragraphs: [
      "The following provisions apply in addition to, and not in substitution for, the provisions set out elsewhere in this policy. They are intended to address specific statutory requirements that arise in particular jurisdictions.",
    ],
    subsections: [
      {
        title: "17.1 United Kingdom and European Economic Area",
        paragraphs: [
          "Where the United Kingdom General Data Protection Regulation or the European Union General Data Protection Regulation applies to our processing of your personal data, the controller is Aviate Pro ME LLC Group acting through its Glasgow office for matters concerning the United Kingdom and through its relevant office for matters concerning other European territories. You have the right to lodge a complaint with the United Kingdom Information Commissioner's Office or with the competent supervisory authority in the European Union member state where you reside, where you work, or where the alleged infringement occurred.",
        ],
      },
      {
        title: "17.2 California",
        paragraphs: [
          "If you are a resident of the State of California, you have specific rights under the California Consumer Privacy Act, as amended by the California Privacy Rights Act. These rights include the right to know what personal information we collect about you, the right to request deletion of personal information, the right to request correction of inaccurate personal information, the right to opt out of the sale or sharing of personal information, and the right not to be subject to discriminatory treatment for the exercise of any of these rights. As stated above, we do not sell personal information. You may exercise your California rights by contacting our Sherman Oaks office through the channels set out in Section 16.",
        ],
      },
      {
        title: "17.3 State of Qatar",
        paragraphs: [
          "Where the data protection law of the State of Qatar applies, our processing of your personal data is carried out in accordance with the requirements of that law, including those relating to consent, transparency, security, and the rights of data subjects. Enquiries concerning Qatari data protection matters may be addressed to our Doha office.",
        ],
      },
      {
        title: "17.4 Islamic Republic of Pakistan",
        paragraphs: [
          "Where the laws of the Islamic Republic of Pakistan apply to our processing of your personal data, including any successor framework to existing electronic transaction and data protection legislation, we comply with all applicable statutory requirements. Enquiries may be addressed to our Islamabad office, which serves as the principal administrative seat of the Group.",
        ],
      },
    ],
  },
]

const contactRows = [
  ["Email", "info@aviatepro.me"],
  ["Website", "aviatepro.me | aeroaviation.me"],
  ["Islamabad Office", "Islamic Republic of Pakistan"],
  ["Doha Office", "State of Qatar"],
  ["Sherman Oaks Office", "California, United States of America"],
  ["Glasgow Office", "United Kingdom"],
]

function sectionLabel(section: PolicySection) {
  return `Section ${Number(section.number)}`
}

export default function PrivacyPolicyPage() {
  return (
    <main className="relative z-10 mt-32 min-h-screen bg-black text-white mt-40">
      <section className="border-b border-zinc-900 px-6 pb-16 pt-20 lg:px-12 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="max-w-4xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            Privacy Policy
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-zinc-400 mb-2">
            Data Protection and Information Governance Framework published for the Aero Aviation digital estate at aeroaviation.me.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 backdrop-blur-xl md:p-8">
            <div className="mb-7 flex flex-col gap-3 border-b border-zinc-800 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Table of Contents</p>
                <h2 className="mt-2 text-2xl font-light text-zinc-100 md:text-3xl">Policy Sections</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-zinc-500">
                Select a section below to jump directly to that part of the Privacy Policy.
              </p>
            </div>

            <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="mt-2 grid grid-cols-[96px_1fr] items-start gap-4 rounded-xl border border-zinc-900 px-4 py-3 text-sm transition hover:border-sky-500/40 hover:bg-zinc-900/70 hover:text-sky-300"
                >
                  <span className="font-mono text-xs uppercase tracking-wide text-sky-400 mt-4">{sectionLabel(section)}</span>
                  <span className="leading-6 text-zinc-300">{section.title}</span>
                </a>
              ))}
            </nav>
          </div>

          <article className="mx-auto max-w-4xl">
            <div className="mb-16 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-6 text-zinc-300 md:p-8 mt-2">
              <p className="leading-8">
                This Privacy Policy explains how Aero Aviation, operating as a division of Aviate Pro ME LLC Group, collects, uses, stores, shares, and safeguards personal information when you interact with our website, flight operations and dispatch services, and the Flight Core Intelligence platform.
              </p>
            </div>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-32 border-b border-zinc-900 py-14 first:pt-0">
                <div className="mb-10 grid gap-3 sm:grid-cols-[120px_1fr] sm:items-start">
                  <span className="pt-2 font-mono text-sm uppercase tracking-wide text-sky-400">{sectionLabel(section)}</span>
                  <h2 className="text-3xl font-light leading-tight md:text-4xl">{section.title}</h2>
                </div>
                <div className="space-y-6 text-[15px] leading-8 text-zinc-400 md:text-base">
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.id === "contact" && (
                    <div className="my-10 overflow-hidden rounded-2xl border border-zinc-800">
                      {contactRows.map(([label, value]) => (
                        <div key={label} className="grid gap-2 border-b border-zinc-800 bg-zinc-950/80 px-5 py-4 last:border-0 sm:grid-cols-[180px_1fr]">
                          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
                          <span className="text-zinc-200">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {section.subsections?.map((subsection) => (
                    <div key={subsection.title} className="pt-7">
                      <h3 className="mb-5 text-xl font-medium text-zinc-100">{subsection.title}</h3>
                      <div className="space-y-6">
                        {subsection.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <div className="mt-16 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm leading-7 text-zinc-400">
              <p className="font-semibold uppercase tracking-wider text-amber-300">End of Privacy Policy</p>
              <p className="mt-3">
                This document is the property of Aviate Pro ME LLC Group. It has been prepared by the Legal and Compliance Department for publication on aeroaviation.me. It does not constitute legal advice and should be reviewed by qualified counsel admitted in each jurisdiction relevant to your particular circumstances before reliance is placed upon it for compliance purposes.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-950 px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">{label}</p>
      <p className="mt-2 text-sm font-medium text-zinc-200">{value}</p>
    </div>
  )
}
