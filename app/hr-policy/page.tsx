"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useCallback } from "react"

const tocItems = [
  {
    title: "Foundations",
    id: "foundations",
    items: [
      { title: "01 Introduction", id: "01" },
      { title: "02 Purpose & Objectives", id: "02" },
      { title: "03 Scope of Application", id: "03" },
      { title: "04 Definitions", id: "04" },
    ],
  },
  {
    title: "Employment",
    id: "employment",
    items: [
      { title: "05 Equal Opportunity", id: "05" },
      { title: "06 Recruitment & Selection", id: "06" },
      { title: "07 Employment Contracts", id: "07" },
      { title: "08 Probationary Period", id: "08" },
      { title: "09 Working Hours", id: "09" },
    ],
  },
  {
    title: "Remuneration & Leave",
    id: "remuneration",
    items: [
      { title: "10 Compensation & Payroll", id: "10" },
      { title: "11 Employee Benefits", id: "11" },
      { title: "12 Leave Entitlements", id: "12" },
    ],
  },
  {
    title: "Performance & Conduct",
    id: "performance",
    items: [
      { title: "13 Performance Management", id: "13" },
      { title: "14 Training & Development", id: "14" },
      { title: "15 Code of Conduct", id: "15" },
      { title: "16 Anti-Bribery & Corruption", id: "16" },
      { title: "17 Confidentiality & Data", id: "17" },
      { title: "18 Anti-Harassment", id: "18" },
      { title: "19 Health & Safety", id: "19" },
      { title: "20 Social Media", id: "20" },
    ],
  },
  {
    title: "Procedures & Compliance",
    id: "procedures",
    items: [
      { title: "21 Grievance Procedure", id: "21" },
      { title: "22 Disciplinary Procedure", id: "22" },
      { title: "23 Legal Records & Termination", id: "23" },
      { title: "24 Termination — General", id: "24" },
      { title: "25 Whistleblowing", id: "25" },
      { title: "26 Compliance & Review", id: "26" },
      { title: "27 Acknowledgement", id: "27" },
    ],
  },
]

export default function HRPolicyPage() {
  const [activeSection, setActiveSection] = useState("01")

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveSection(entry.target.id)
      }
    })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "0px 0px -60% 0px",
      threshold: 0.1,
    })

    const ids = tocItems.flatMap((group) => group.items.map((item) => item.id))
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    tocItems.forEach((group) => {
      const el = document.getElementById(group.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [handleIntersection])

  return (
    <main className="relative bg-black text-white overflow-hidden mt-40">
      {/* Hero */}
      <section className="relative z-20 min-h-[35vh] flex flex-col justify-end pb-12">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] text-balance text-white"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Human Resources
            <br />
            Policy
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-zinc-400 mt-6 max-w-3xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            This document establishes the foundational framework governing the employment relationship between Aviate
            Pro ME LLC Group and all individuals engaged in its service across all jurisdictions and operating entities.
          </motion.p>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-20 mt-10">
        <div className="container mx-auto px-6 lg:px-12">
          <hr className="border-zinc-800" />
        </div>
      </div>

      {/* Content with TOC on the right */}
      <section className="relative z-20 py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-16">
            {/* Policy Content – now on the left */}
            <div className="max-w-3xl">
              <PolicySection id="foundations" title="Foundations" />
              <Section01 />
              <Section02 />
              <Section03 />
              <Section04 />

              <PolicySection id="employment" title="Employment" />
              <Section05 />
              <Section06 />
              <Section07 />
              <Section08 />
              <Section09 />

              <PolicySection id="remuneration" title="Remuneration & Leave" />
              <Section10 />
              <Section11 />
              <Section12 />

              <PolicySection id="performance" title="Performance & Conduct" />
              <Section13 />
              <Section14 />
              <Section15 />
              <Section16 />
              <Section17 />
              <Section18 />
              <Section19 />
              <Section20 />

              <PolicySection id="procedures" title="Procedures & Compliance" />
              <Section21 />
              <Section22 />
              <Section23 />
              <Section24 />
              <Section25 />
              <Section26 />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/*  Group Heading                                                      */
/* ------------------------------------------------------------------ */
function PolicySection({ id, title }: { id: string; title: string }) {
  return (
    <motion.div
      id={id}
      className="mb-16 pt-4"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h2 className="text-3xl md:text-4xl font-light text-white mb-2">{title}</h2>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Individual Sections (01 – 27)                                     */
/* ------------------------------------------------------------------ */
function Section01() {
  return (
    <motion.div
      id="01"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">01 Introduction</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          Aviate Pro ME LLC Group (hereinafter referred to as &quot;the Group&quot;) is a globally operating aviation
          services and fleet management enterprise with offices in Glasgow, United Kingdom; Doha, Qatar; and Sherman
          Oaks, California, USA. The Group encompasses its principal operating entities, namely Aviate Pro ME LLC,
          Aero Aviation, Aviate Pakistan, and Flight Core Intelligence, each of which delivers specialised services
          within the global aviation ecosystem.
        </p>
        <p>
          This Human Resources Policy (hereinafter referred to as &quot;the Policy&quot;) establishes the foundational
          framework governing the employment relationship between the Group and all individuals engaged in its service,
          whether on a permanent, fixed-term, part-time, or contractual basis. It reflects the Group&apos;s commitment
          to maintaining a professional, equitable, lawful, and high-performance work environment across all
          jurisdictions in which it operates.
        </p>
        <p>
          The Policy is binding upon every member of the workforce, from executive leadership to operational staff,
          and from full-time employees to consultants and seconded personnel. All persons subject to this Policy are
          required to read it carefully, acknowledge its provisions, and conduct themselves in full accordance with
          its requirements at all times.
        </p>
      </div>
    </motion.div>
  )
}

function Section02() {
  return (
    <motion.div
      id="02"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">02 Purpose and Objectives</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          The primary purpose of this Policy is to articulate, in clear and enforceable terms, the rights,
          responsibilities, and expectations applicable to all members of the Group&apos;s workforce. Through this
          framework, the Group seeks to achieve the following objectives:
        </p>
        <ol className="list-decimal pl-5 space-y-3">
          <li>
            To establish a consistent, transparent, and fair set of employment standards applicable across all Group
            entities and operating locations.
          </li>
          <li>
            To ensure that the Group&apos;s employment practices comply in full with the applicable laws and
            regulations of each jurisdiction in which the Group operates, including the United Kingdom, the State of
            Qatar, and the United States of America.
          </li>
          <li>
            To foster a workplace culture grounded in respect, accountability, excellence, and professional integrity.
          </li>
          <li>
            To provide clear and accessible guidance on employment processes, entitlements, conduct expectations, and
            disciplinary procedures.
          </li>
          <li>
            To protect the interests of the Group and its employees through the equitable and lawful resolution of
            workplace matters.
          </li>
        </ol>
      </div>
    </motion.div>
  )
}

function Section03() {
  return (
    <motion.div
      id="03"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">03 Scope of Application</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          This Policy applies universally to all persons engaged by the Group in any capacity, across all entities,
          offices, and jurisdictions. This includes permanent employees, fixed-term contract employees, part-time
          employees, consultants retained on an ongoing basis, interns and trainees, seconded personnel, and
          individuals working under agency or service arrangements where such individuals are functionally integrated
          into the Group&apos;s operations.
        </p>
        <p>
          Where specific provisions of this Policy may conflict with local statutory requirements in a particular
          jurisdiction, the applicable mandatory provisions of local law shall take precedence in that jurisdiction to
          the extent of the inconsistency. In all other respects, this Policy shall govern the employment relationship
          in its entirety.
        </p>
      </div>
    </motion.div>
  )
}

function Section04() {
  return (
    <motion.div
      id="04"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">04 Definitions</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>For the purposes of this Policy, the following terms shall carry the meanings assigned to them herein:</p>
        <div className="space-y-4">
          <div>
            <strong className="text-white">The Group</strong> – Aviate Pro ME LLC Group and all its subsidiary and
            affiliated entities, including Aviate Pro ME LLC, Aero Aviation, Aviate Pakistan, and Flight Core
            Intelligence.
          </div>
          <div>
            <strong className="text-white">Employee</strong> – Any individual engaged by the Group under a contract
            of employment, whether permanent, fixed-term, or part-time.
          </div>
          <div>
            <strong className="text-white">Contractor / Consultant</strong> – Any individual or entity engaged by the
            Group under a service or consultancy agreement who is not classified as an employee.
          </div>
          <div>
            <strong className="text-white">Line Manager</strong> – The individual holding supervisory or managerial
            responsibility over an employee within the organisational hierarchy.
          </div>
          <div>
            <strong className="text-white">HR Department</strong> – The Human Resources function of the Group,
            responsible for administering this Policy and all related employment matters.
          </div>
          <div>
            <strong className="text-white">Misconduct</strong> – Any act or omission by an employee that constitutes a
            breach of the Group&apos;s policies, standards of conduct, or applicable law.
          </div>
          <div>
            <strong className="text-white">Gross Misconduct</strong> – Serious misconduct of a nature that
            fundamentally undermines the employment relationship and may warrant summary termination.
          </div>
          <div>
            <strong className="text-white">Legal Record</strong> – Any criminal conviction, caution, charge,
            indictment, or regulatory finding made against an individual by a competent legal authority in any
            jurisdiction in which the Group operates.
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Section05() {
  return (
    <motion.div
      id="05"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">05 Equal Opportunity and Non-Discrimination</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          Aviate Pro ME LLC Group is committed to providing a working environment that is free from unlawful
          discrimination, harassment, and victimisation. The Group affirms that all employment decisions, including
          recruitment, selection, compensation, promotion, training, and termination, shall be made on the basis of
          merit, capability, qualifications, and the lawful requirements of the role, without regard to race, colour,
          national origin, religion, gender, age, disability, marital status, or any other characteristic protected by
          applicable law in the relevant jurisdiction.
        </p>
        <p>
          This commitment extends across all Group entities and applies equally to the treatment of employees,
          candidates for employment, contractors, clients, and all other persons with whom the Group interacts in the
          course of its operations. Any employee found to have engaged in discriminatory conduct shall be subject to
          disciplinary action, which may include termination of employment.
        </p>
      </div>
    </motion.div>
  )
}

function Section06() {
  return (
    <motion.div
      id="06"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">06 Recruitment and Selection</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="text-lg font-light text-white mb-2">6.1 — Recruitment Principles</h4>
          <p>
            The Group recruits on the basis of open competition, merit, and alignment with the operational
            requirements of each role. All recruitment activity shall be overseen by the HR Department in
            coordination with the relevant line management, and shall adhere strictly to this Policy and any
            applicable local employment regulations.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">6.2 — Background Verification</h4>
          <p>
            Every candidate selected for employment with the Group shall be subject to a comprehensive
            pre-employment verification process prior to the commencement of their engagement. This process shall
            include verification of academic qualifications, professional certifications and licences, employment
            history, and where legally permissible and operationally warranted, a criminal background check. Any
            material misrepresentation or omission discovered during or after the verification process shall
            constitute grounds for the withdrawal of an offer of employment or, in the event the individual has
            already commenced their role, immediate termination of employment.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">6.3 — Offers of Employment</h4>
          <p>
            All offers of employment extended by the Group shall be made in writing by an authorised representative
            of the HR Department. Verbal offers shall not constitute a binding commitment on the part of the Group.
            Each written offer shall specify the position, reporting structure, compensation, working location, start
            date, and the principal conditions of employment.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function Section07() {
  return (
    <motion.div
      id="07"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">07 Employment Contracts</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          Every individual employed by the Group shall be issued a written contract of employment prior to or upon
          their commencement of work. The contract shall set out, at minimum, the job title, duties, reporting line,
          place of work, working hours, remuneration, benefits, notice period, confidentiality obligations, applicable
          governing law, and reference to this Policy as a binding document incorporated into the employment
          relationship.
        </p>
        <p>
          Employment contracts may be of a permanent, fixed-term, or part-time nature depending on the operational
          requirements of the Group and the applicable laws of the jurisdiction in which the employee is engaged.
          Fixed-term contracts shall not be automatically renewed upon their expiry unless a new written agreement is
          executed by both parties.
        </p>
      </div>
    </motion.div>
  )
}

function Section08() {
  return (
    <motion.div
      id="08"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">08 Probationary Period</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          All new employees shall be subject to a probationary period, the duration of which shall be specified in
          their individual employment contract. Unless otherwise stated, the standard probationary period for the Group
          shall be three months from the commencement of employment, which may be extended by the Group for a further
          period of up to three additional months where the HR Department and the relevant line manager determine that
          additional assessment is warranted.
        </p>
        <p>
          During the probationary period, the Group shall conduct structured performance reviews to evaluate the
          employee&apos;s suitability for the role. Successful completion of the probationary period shall be confirmed
          to the employee in writing by the HR Department.
        </p>
      </div>
    </motion.div>
  )
}

function Section09() {
  return (
    <motion.div
      id="09"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">09 Working Hours and Attendance</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          Standard working hours for the Group shall be as specified in each employee&apos;s contract of employment,
          in accordance with the statutory working time requirements of the relevant jurisdiction. Employees are
          expected to maintain reliable and punctual attendance at all times. Overtime, where required and approved
          in advance by a line manager, shall be compensated in accordance with applicable local law and the terms of
          the individual employment contract.
        </p>
        <p>
          Unexplained or repeated absence from work shall be treated as a conduct matter and managed through the
          Group&apos;s disciplinary procedures. Employees who anticipate absence are required to notify their line
          manager at the earliest practicable opportunity.
        </p>
      </div>
    </motion.div>
  )
}

function Section10() {
  return (
    <motion.div
      id="10"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">10 Compensation and Payroll</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          The Group is committed to providing fair and competitive compensation to all employees, commensurate with
          their skills, experience, responsibilities, and the prevailing market conditions in the relevant
          jurisdiction. Compensation shall be reviewed periodically, with formal reviews typically conducted on an
          annual basis.
        </p>
        <p>
          Salaries shall be paid in the currency and by the method specified in each employee&apos;s employment
          contract, in accordance with the statutory payroll requirements of the relevant jurisdiction. All applicable
          statutory deductions shall be made in full compliance with local law. Employees shall not disclose their
          salary or benefit information to colleagues or third parties, as compensation details are considered
          confidential.
        </p>
      </div>
    </motion.div>
  )
}

function Section11() {
  return (
    <motion.div
      id="11"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">11 Employee Benefits</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          The Group provides a range of employment benefits, the specific composition of which may vary between
          jurisdictions and employee categories. Benefits are detailed in the individual employment contract and in
          any supplementary benefits schedule issued by the HR Department. Benefits may include, where applicable
          and subject to local requirements, annual flight allowances, health insurance coverage, end-of-service
          gratuity, housing or transportation allowances, and professional development support.
        </p>
        <p>
          The Group reserves the right to review, adjust, or where operationally necessary withdraw benefits, subject
          to providing reasonable notice and adhering to any contractual or statutory obligations in the relevant
          jurisdiction.
        </p>
      </div>
    </motion.div>
  )
}

function Section12() {
  return (
    <motion.div
      id="12"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">12 Leave Entitlements</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="text-lg font-light text-white mb-2">12.1 — Annual Leave</h4>
          <p>
            Employees shall accrue paid annual leave in accordance with the statutory minimum entitlement of the
            jurisdiction in which they are employed, or the entitlement set out in their employment contract,
            whichever is the greater. Leave must be requested in advance and is subject to approval by the
            employee&apos;s line manager.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">12.2 — Sick Leave</h4>
          <p>
            Employees who are unable to attend work due to illness or injury are entitled to a period of paid sick
            leave in accordance with the statutory provisions of the relevant jurisdiction. Employees are required to
            notify their line manager of their absence as early as possible on the first day of illness.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">12.3 — Public Holidays</h4>
          <p>
            Employees shall be entitled to paid leave on all gazetted public holidays applicable in their primary
            place of work, in accordance with local statutory requirements.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">12.4 — Maternity, Paternity, and Parental Leave</h4>
          <p>
            The Group shall comply fully with the statutory maternity, paternity, and parental leave entitlements
            applicable in each jurisdiction. The Group is committed to supporting working parents and shall not treat
            the exercise of any statutory parental leave right as detrimental to the employee&apos;s employment
            relationship.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">12.5 — Other Leave</h4>
          <p>
            Additional categories of leave, including bereavement leave, study leave, and emergency leave, shall be
            granted in accordance with applicable local law and the Group&apos;s supplementary leave guidelines as
            issued by the HR Department from time to time.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function Section13() {
  return (
    <motion.div
      id="13"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">13 Performance Management</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          The Group operates a structured performance management framework designed to set clear expectations, support
          employee development, and recognise and reward high performance. Performance objectives for each employee
          shall be established at the commencement of the performance year and shall be reviewed formally at least
          twice annually.
        </p>
        <p>
          Employees who are performing below the expected standard shall receive documented feedback and shall be
          supported through a Performance Improvement Plan, which shall set clear and measurable targets, identify
          the support available, and specify the timeframe within which improvement is expected. Failure to achieve
          the standards set out in a Performance Improvement Plan may result in further disciplinary action,
          including termination of employment.
        </p>
      </div>
    </motion.div>
  )
}

function Section14() {
  return (
    <motion.div
      id="14"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">14 Training and Professional Development</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          Aviate Pro ME LLC Group is deeply committed to the continuous development of its workforce. The Group
          recognises that investment in training and professional development is fundamental to maintaining
          operational excellence, regulatory compliance, and competitive capability within the global aviation
          industry.
        </p>
        <p>
          Employees in roles requiring mandatory regulatory qualifications, such as aviation licences, simulator
          certifications, or safety management competencies, shall be supported in maintaining current and valid
          credentials at all times. Employees who receive training funded by the Group may be required to remain in
          employment for a minimum period following the completion of such training, as specified in a training bond
          or cost recovery agreement.
        </p>
      </div>
    </motion.div>
  )
}

function Section15() {
  return (
    <motion.div
      id="15"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">15 Code of Conduct and Professional Standards</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          Every person subject to this Policy is required to conduct themselves at all times with the highest
          standards of professional integrity, honesty, and respect, whether in the workplace, whilst representing
          the Group externally, or in any capacity where their conduct may reflect upon the Group&apos;s reputation
          and standing.
        </p>
        <div>
          <h4 className="text-lg font-light text-white mb-2">15.1 — Conflicts of Interest</h4>
          <p>
            Employees must avoid situations in which their personal interests conflict or may conflict with the
            interests of the Group. Any actual or potential conflict of interest must be disclosed promptly and in
            writing to the HR Department and the relevant line manager.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">15.2 — Gifts and Hospitality</h4>
          <p>
            Employees shall not solicit gifts, hospitality, or any other benefit from any person or organisation
            doing business with or seeking to do business with the Group. The acceptance of unsolicited gifts must be
            disclosed to the HR Department.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">15.3 — Use of Group Resources</h4>
          <p>
            Group resources shall be used only for legitimate Group business purposes. Any fraudulent, wasteful, or
            unauthorised use of Group resources shall constitute gross misconduct.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">15.4 — Dress and Presentation</h4>
          <p>
            Employees are expected to maintain a professional standard of dress and personal presentation appropriate
            to their role and working environment.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function Section16() {
  return (
    <motion.div
      id="16"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">16 Anti-Bribery and Anti-Corruption</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          The Group adopts a zero-tolerance position towards bribery and corruption in all its forms. No employee,
          consultant, or representative of the Group shall offer, pay, promise, authorise, or accept any bribe,
          kickback, facilitation payment, or any other improper financial or non-financial advantage, whether directly
          or through a third party.
        </p>
        <p>
          Compliance with this provision is mandatory. Any suspected breach shall be reported immediately to senior
          management or through the Group&apos;s confidential reporting mechanism, and shall be investigated promptly.
          Breach of this provision shall constitute gross misconduct and may also result in referral to the relevant
          law enforcement authorities.
        </p>
      </div>
    </motion.div>
  )
}

function Section17() {
  return (
    <motion.div
      id="17"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">17 Confidentiality and Data Protection</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="text-lg font-light text-white mb-2">17.1 — Confidentiality of Information</h4>
          <p>
            All employees have access, in the course of their employment, to information that is commercially
            sensitive, proprietary, or otherwise confidential to the Group or its clients. Each employee is required
            to treat such information with the utmost discretion and shall not disclose it, whether directly or
            indirectly, to any unauthorised person during the course of their employment or at any time thereafter.
            This obligation shall survive the termination of the employment relationship.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">17.2 — Data Protection</h4>
          <p>
            The Group processes personal data relating to employees and other individuals in the course of its
            operations. Such processing is conducted in accordance with the data protection and privacy laws
            applicable in each relevant jurisdiction, including the UK General Data Protection Regulation where
            applicable. Any suspected breach of data security must be reported immediately to the HR Department.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function Section18() {
  return (
    <motion.div
      id="18"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">18 Anti-Harassment, Bullying, and Workplace Respect</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          The Group is unequivocally committed to maintaining a working environment in which every individual is
          treated with dignity and respect. Harassment, bullying, intimidation, and victimisation in any form are
          strictly prohibited, regardless of the medium through which such conduct occurs or the seniority of the
          persons involved.
        </p>
        <p>
          Sexual harassment, including unwanted physical contact, sexually suggestive communications, and the display
          of inappropriate material, is a form of gross misconduct and shall be treated as such. Any employee who
          believes they have been subjected to harassment, bullying, or discriminatory conduct is encouraged to
          report the matter without delay to the HR Department. Retaliation against any employee for raising a
          complaint in good faith is itself a serious disciplinary matter.
        </p>
      </div>
    </motion.div>
  )
}

function Section19() {
  return (
    <motion.div
      id="19"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">19 Health, Safety, and Wellbeing</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          The Group regards the health, safety, and wellbeing of its workforce as a matter of paramount importance.
          It is the Group&apos;s absolute commitment to provide and maintain, so far as is reasonably practicable, a
          safe working environment for all employees, contractors, and visitors across all its operational locations.
        </p>
        <p>
          All employees are required to comply with the health and safety policies, procedures, and instructions
          applicable to their place of work, to report any hazards, accidents, near-misses, or unsafe conditions to
          their line manager without delay, and to cooperate fully with any health and safety investigation or audit
          conducted by or on behalf of the Group. Aviation operations carried out by or under the auspices of the
          Group&apos;s entities are subject to the specific safety management system requirements of the applicable
          regulatory authority, including the UK Civil Aviation Authority, the European Union Aviation Safety Agency,
          and the Federal Aviation Administration.
        </p>
      </div>
    </motion.div>
  )
}

function Section20() {
  return (
    <motion.div
      id="20"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">20 Social Media and External Communications</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          Employees must exercise sound professional judgement in all their communications on social media and other
          public platforms, whether in a personal or professional capacity, where such communications may relate to,
          reference, or reflect upon the Group, its clients, its partners, or the aviation industry more broadly.
        </p>
        <p>
          Employees are prohibited from publishing, posting, or sharing content that discloses confidential Group
          information, disparages the Group or its clients, makes unauthorised representations on behalf of the
          Group, or constitutes harassment or defamation of any individual connected with the Group.
        </p>
      </div>
    </motion.div>
  )
}

function Section21() {
  return (
    <motion.div
      id="21"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">21 Grievance Procedure</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          The Group recognises that situations may arise in which an employee has a concern or grievance relating to
          their employment. The Group is committed to addressing all such concerns promptly, fairly, and in accordance
          with applicable law. Employees are encouraged to raise concerns informally with their line manager in the
          first instance wherever this is practicable.
        </p>
        <p>
          Where an informal resolution is not possible or appropriate, the employee may submit a formal written
          grievance to the HR Department. Upon receipt of a formal grievance, the HR Department shall acknowledge the
          submission, appoint an appropriate investigating officer, conduct a thorough and impartial investigation,
          and provide the employee with a written outcome within the timeframe prescribed by local law. The employee
          shall have the right to appeal any outcome through the Group&apos;s internal appeals process.
        </p>
      </div>
    </motion.div>
  )
}

function Section22() {
  return (
    <motion.div
      id="22"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">22 Disciplinary Procedure</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="text-lg font-light text-white mb-2">22.1 — General Principles</h4>
          <p>
            The purpose of the Group&apos;s disciplinary procedure is to ensure that concerns regarding the conduct or
            performance of employees are addressed consistently, fairly, and in accordance with the principles of
            natural justice and applicable employment law. The Group shall apply a graduated approach to discipline,
            with the severity of any sanction being proportionate to the nature and gravity of the matter concerned.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">22.2 — Stages of Discipline</h4>
          <ul className="space-y-2 pl-5">
            <li>
              <strong className="text-white">Stage 1 — Verbal Warning:</strong> Issued for minor matters. Confirmed in
              writing and retained on the employee&apos;s personnel file.
            </li>
            <li>
              <strong className="text-white">Stage 2 — Written Warning:</strong> Invoked where the matter is more
              serious or where a verbal warning has not resulted in the necessary improvement.
            </li>
            <li>
              <strong className="text-white">Stage 3 — Final Written Warning:</strong> Issued where prior warnings
              have not produced the required improvement, or where the conduct is serious but does not constitute gross
              misconduct.
            </li>
            <li>
              <strong className="text-white">Stage 4 — Termination of Employment:</strong> Where an employee fails to
              improve following a final written warning, or where the conduct constitutes gross misconduct.
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">22.3 — Suspension</h4>
          <p>
            The Group may suspend an employee with pay pending investigation of a disciplinary matter where it
            reasonably believes that the employee&apos;s continued presence in the workplace may hinder the
            investigation, compromise the safety or wellbeing of others, or cause damage to the Group&apos;s interests.
            Suspension is a neutral act and does not constitute a finding of guilt or a disciplinary sanction.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function Section23() {
  return (
    <motion.div
      id="23"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">23 Legal Records and Mandatory Contract Termination</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          This section sets forth the Group&apos;s policy with respect to legal records arising in any jurisdiction in
          which the Group operates and their direct consequences for the employment relationship.
        </p>
        <div>
          <h4 className="text-lg font-light text-white mb-2">Disclosure Obligation</h4>
          <p>
            Every employee is required, as a condition of their continued engagement with the Group, to disclose
            promptly and in writing to the HR Department any criminal charge, indictment, conviction, caution,
            regulatory finding, civil judgment, or other legal record that arises in relation to them in any
            jurisdiction, whether during the course of their employment or during the pre-employment period where such
            information was not previously disclosed. Disclosure must be made within five working days of the employee
            becoming aware of the relevant legal development. Deliberate concealment of a legal record shall itself
            constitute an independent act of gross misconduct.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">23.2 — Mandatory Termination upon Legal Record</h4>
          <p className="font-medium text-white">Core Provision — Contract Termination</p>
          <p>
            Where any legal record comes through or is established against an employee by a competent legal authority
            in any jurisdiction in which the Group operates, and where such record relates to conduct that, in the
            reasonable assessment of the Group, is incompatible with the employee&apos;s continued service, the
            employment contract of the relevant individual shall be terminated. The Group reserves the absolute right
            to terminate where the legal record, having been assessed by the HR Department in consultation with
            appropriate legal counsel, is determined to be materially inconsistent with the trust, integrity,
            regulatory standing, or operational requirements that the employment relationship demands.
          </p>
          <p>
            Legal records that shall in all circumstances result in mandatory termination include, without limitation:
            any conviction for a criminal offence involving dishonesty, fraud, bribery, corruption, or breach of
            trust; any conviction for a violent or sexual offence; any conviction for an offence under applicable
            aviation safety or regulatory law; any regulatory disqualification, licence revocation, or fitness
            determination adverse to the employee issued by a competent aviation or professional authority; and any
            civil or regulatory finding of fraudulent, deceptive, or grossly negligent conduct in a professional or
            commercial context.
          </p>
          <p>
            For the avoidance of doubt, the mandatory termination provision applies regardless of whether the legal
            record arose prior to or during the course of employment, provided that in pre-employment cases, the
            record was not previously known to the Group and would have been material to the decision to engage the
            individual.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">23.3 — Jurisdiction-Specific Application</h4>
          <p>
            The Group currently operates in the United Kingdom, the State of Qatar, and the United States of America.
            The mandatory termination provision under this section applies in all three jurisdictions and is informed
            by the legal frameworks of each, including the laws of the United Kingdom and applicable regulations of
            the Civil Aviation Authority, the laws of the State of Qatar and applicable GCC regulatory instruments,
            and the federal and state laws of the United States, including any applicable Federal Aviation
            Regulations.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">23.4 — Process and Rights</h4>
          <p>
            Prior to exercising its right of mandatory termination under this section, the Group shall, to the extent
            required by applicable local employment law, provide the employee with written notice of the Group&apos;s
            intention, the basis for the proposed termination, and an opportunity to make representations to the HR
            Department. The Group shall consider any such representations in good faith before issuing a final
            decision.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function Section24() {
  return (
    <motion.div
      id="24"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">24 Termination of Employment — General Provisions</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="text-lg font-light text-white mb-2">24.1 — Resignation</h4>
          <p>
            An employee wishing to resign from their employment must provide written notice to the HR Department and
            their line manager in accordance with the notice period specified in their employment contract or, where
            longer, the minimum statutory notice period required by applicable local law.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">24.2 — Termination by the Group</h4>
          <p>
            The Group may terminate the employment of any employee for a legitimate reason, including but not limited
            to redundancy, expiry of a fixed-term contract, incapability to perform the role, breach of contract,
            disciplinary outcome, or the mandatory termination provisions set out in this Policy. All terminations
            shall be effected in accordance with the applicable provisions of local employment law.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">24.3 — End of Service Entitlements</h4>
          <p>
            Upon the termination of employment for any reason, the Group shall calculate and pay to the employee all
            sums to which they are legally and contractually entitled, including any accrued but untaken annual leave,
            any outstanding salary for the final pay period, and any applicable end-of-service gratuity or statutory
            severance payment.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-light text-white mb-2">24.4 — Return of Group Property</h4>
          <p>
            Upon the termination of employment, the employee shall be required to return immediately all property
            belonging to the Group, including identification credentials, access cards, electronic devices, vehicles,
            keys, documentation, and any other item issued by the Group in connection with their employment.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function Section25() {
  return (
    <motion.div
      id="25"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">25 Whistleblowing and Reporting of Concerns</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          The Group is committed to maintaining a culture of openness and accountability in which employees feel safe
          and supported in raising concerns about potential wrongdoing. Any employee who has a genuine concern about
          illegal activity, regulatory non-compliance, financial irregularity, safety risk, or serious breach of
          Group policy is encouraged to report that concern through the appropriate internal channel.
        </p>
        <p>
          The Group undertakes not to subject any employee who makes a report in good faith to any detriment,
          retaliation, or adverse treatment as a result of their having done so. This protection applies regardless
          of whether the concern is ultimately found to be substantiated, provided the report was made honestly and
          without malicious intent.
        </p>
      </div>
    </motion.div>
  )
}

function Section26() {
  return (
    <motion.div
      id="26"
      className="mb-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-2xl font-light text-white mb-6">26 Compliance, Review, and Amendment</h3>
      <div className="text-zinc-400 space-y-4 leading-relaxed">
        <p>
          All employees, managers, and senior leaders of the Group are personally responsible for ensuring their own
          compliance with this Policy and for fostering compliance within their areas of responsibility. The HR
          Department is responsible for the administration, interpretation, and enforcement of this Policy across all
          Group entities.
        </p>
        <p>
          This Policy shall be reviewed at least annually by the HR Department and, where necessary, updated to
          reflect changes in applicable law, regulatory requirements, organisational structure, or operational
          practice. Any material amendment to this Policy shall be communicated to all employees in a timely manner,
          and the amended version shall supersede all prior versions from the effective date of the amendment.
        </p>
      </div>
    </motion.div>
  )
}
