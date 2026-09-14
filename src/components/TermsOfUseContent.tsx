import React from 'react'
import { LegalH2, LegalP, LegalScreen } from './LegalDocument'

const TERMS_SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: '1. Introduction – your agreement with us',
    paragraphs: [
      '1.1 Your agreement is with Check a Review whose registered office is at 125 Deansgate. Greater Manchester M3 2BY',
      '1.2 The Agreement consists of the Order Form, any Special Conditions and these terms and conditions. No other document or statement will form any part of this Agreement.',
      '1.3 If there is a conflict or inconsistency between any of the documents forming this Agreement, the following order of precedence will apply:',
      '1.3.1 any Special Conditions;',
      '1.3.2 the Order Form; and then',
      '1.3.3 these terms and conditions.',
      '1.4 Definitions used in this Agreement are as set out in the Order Form and/or set out at the end of these terms and conditions.',
    ],
  },
  {
    title: '2. Commencement and Term',
    paragraphs: [
      '2.1 This Agreement commences on the Commencement Date and it will remain in effect for the duration of the Initial Term, and thereafter shall automatically renew for additional successive 12-month terms (a “Renewal Term”) unless terminated earlier in accordance with its terms.',
      '2.2 Either party may terminate this Agreement by giving the other party 90 days advance written Notice which will take effect from the next invoicing date. Such termination shall not take effect until 3 months prior to expiration of the then-current Term. If either party fails to provide the required 90 days advance written Notice, this Agreement shall renew pursuant to clause 2.1 above.',
    ],
  },
  {
    title: '3. Providing and using the services',
    paragraphs: [
      '3.1 We shall supply the Services and Support Services using reasonable skill and care.',
      '3.2 We shall have the right to make changes to the Services and Support Services which are necessary to comply with any applicable law, or which do not materially affect the nature or quality of the Services and Support Services, and we shall notify you in any such event.',
      '3.3 You shall display the Check A Review logo together with the Check A Review Rating on your website at all times in a position where it can be seen by visitors.',
      '3.4 You acknowledge that all Intellectual Property Rights in the Services and the Check A Review Logo are the sole property of Check A Review and/or its licensors. You are granted a non‑exclusive, non‑transferable, revocable licence for the Term to use the Services and the Check A Review solely as provided in this Agreement. You must use reasonable efforts to ensure that you do not do anything which damages the goodwill in the Services and/or the Check A Review logo and name.',
      '3.5 We cannot guarantee that the Check A Review Website or the Services will be available at all times. The Services are provided “as is”, without warranty of any kind save as may be expressly provided in the Order Form. All conditions, warranties and representations implied by law or by trade custom are hereby excluded. It is for you to ensure that the Services we provide under this Agreement are suitable for your business, including upgrading your systems to support updated web browser software. We use reasonable endeavours to use ‘obscenity filters’ on the Check A Review Website.',
    ],
  },
  {
    title: '4. Customer data',
    paragraphs: [
      '4.1 You agree that you are solely responsible for providing us with the Customer Data and you acknowledge that our Services under this Agreement are dependent on the provision to us by you of the Customer Data.',
      '4.2 You warrant, represent and undertake that:',
      '4.2.1 you have the right to lawfully supply us with the Customer Data and that our use of the Customer Data in accordance with the terms of this Agreement shall not be in breach of any Data Privacy Laws, infringe the Intellectual Property Rights of any third party or otherwise be in breach of any applicable law; and',
      '4.2.2 no laws relating to the protection of personal data or privacy apply to you, other than the Data Privacy Laws.',
      'Any breach of this clause 4.2 shall be considered a material breach for the purposes of clause 9.3.2.',
      '4.3 You further warrant, represent and undertake that:',
      '4.3.1 the Customers have not been chosen selectively to manipulate the content or quality of Feedback; and',
      '4.3.2 the Customer Data is genuine, true, accurate and complete in all material respects and has not been manipulated, censored or edited by you.',
      '4.4 Subject to clause 7, we shall only use the Customer Data for the purposes of:',
      '4.4.1 obtaining the Feedback in accordance with the terms of this Agreement;',
      '4.4.2 to inform the Customer of a response you have made to his/her comments;',
      '4.4.3 for the purpose of satisfying our obligations and exercising our rights under this Agreement.',
      '4.5 We will contact Customers by sending a jointly‑branded email to request the Feedback (“Customer Emails”). We retain complete control over the format and content of the Customer Emails. You shall have the right to make requests regarding potential changes to the Customer Emails and we shall use our reasonable endeavours (but are not required) to incorporate any reasonable request made by you into the Customer Emails.',
      '4.6 You grant us a royalty free, non‑exclusive, non‑transferable, irrevocable, for the Term, worldwide licence to use your Intellectual Property Rights in your name, logo, brand and‑get up (“Brand”) for the Customer Emails and the purpose of promoting the Services by means of reference on the Check A Review Website and in our public statements and publicity material to the fact that you are participating in the Services, provided that in doing so we use reasonable efforts to ensure that we do not do anything which damages your Brand.',
    ],
  },
  {
    title: '5. Fees and Payment',
    paragraphs: [
      '5.1 We will invoice you the Service Fee and Support Fee on a monthly basis. For the avoidance of doubt, the Service Fees are due irrespective of whether you have provided us with Customer Data in the relevant month.',
      '5.2 All amounts payable by you exclude value added tax (“VAT”).',
      '5.3 All amounts due under this Agreement shall be paid by you to us in full without any set‑off, counterclaim, deduction or withholding (other than any deduction or withholding of tax which is required by law).',
      '5.4 The Service Fee and Support Fee are calculated by reference to your average monthly feedback requests. Where your average monthly feedback requests in a Quarter exceed your Feedback Request Limit by 10% or more, we reserve the right to increase the Service Fee and/or the Support Fee, provided that such increase shall be no more than a pro-rata increase ( Feedback Request Limit / Fee ) x average monthly feedback requests in Quarter ). Where your Service Fee and/or Support Fee is increased pursuant to this clause 5.4, the average monthly feedback requests in that Quarter shall become your new Feedback Request Limit.',
      '5.5 If you fail to pay any sum due within 14 days of the Payment Date, we may claim interest at the rate of 3% above Barclays Bank Plc’s base rate at the time. Such interest shall accrue on a daily basis from the due date until actual payment of the overdue amount, whether before or after judgment. You shall pay the interest together with the overdue amount.',
      '5.6 We reserve the right to increase the fee by the year on year percentage increase in RPI + 2% or 5%, whichever is the greater, once every 12 months.',
    ],
  },
  {
    title: '6. Feedback',
    paragraphs: [
      '6.1 You agree and acknowledge that we may publish any and all Feedback on the Check A Review Website and may provide such Feedback to Internet‑based search engines for up to two years from the date of receipt from the Customer.',
      '6.2 You shall ensure that all responses made by you to any Customer that has provided feedback are genuine, true and accurate, are not manipulated or misleading in any way and do not contain any material that may reasonably be construed as offensive, defamatory or unlawful.',
      '6.3 On termination of this Agreement, we shall remove all Feedback from your Customers and/or relating to you from the Check A Review Website if requested to do so by you in writing. Feedback may not be used by other feedback websites. For the avoidance of doubt, you may not require us to delete Feedback where we have another purpose for retaining it, or right to retain it, under clauses 6.5.2 or 7.',
      '6.4 To the extent that any Intellectual Property Rights in the Feedback vest in us, and subject to you paying all Fees due in accordance with this Agreement, we hereby assign to you (including by way of future assignment) all the right, title and interest in and to such Intellectual Property Rights.',
      '6.5 Where we assign Intellectual Property Rights in Feedback to you pursuant to clause 6.4, you grant to us:',
      '6.5.1 an exclusive and irrevocable (except in accordance with clause 6.3) licence to continue publishing the Feedback in the form in which it is published on the Check A Review Website;',
      '6.5.2 an exclusive, perpetual, transferable and non-revocable licence to use the Feedback:',
      '6.5.2.1 to carry out market research for ourselves, our clients, or the general public;',
      '6.5.2.2 to compile analysis, reports and other materials,',
      'provided that in each case Feedback is only included in such materials in an anonymised form. For the avoidance of doubt the Intellectual Property Rights in such materials created by us using the Feedback will belong to us.',
    ],
  },
  {
    title: '7. Other purposes',
    paragraphs: [
      '7.1 Notwithstanding clauses 4.4 and 6.5, we will not be restricted in how we use Customer Data or Feedback where:',
      '7.1.1 we have obtained the same data from third parties, including from the Customers themselves;',
      '7.1.2 we are required to use such data in a particular way, or retain it, by applicable law;',
      '7.1.3 we retain such data as part of our business continuity and disaster recovery processes and procedures; or',
      '7.1.4 we require such data to bring or defend potential claims made by third parties.',
    ],
  },
  {
    title: '8. Data protection',
    paragraphs: [
      '8.1 Where a capitalised term used in this clause 8 is not defined within the Order Form or these terms and conditions, it will have the meaning given to it by Data Privacy Laws.',
      '8.2 Each party shall, in relation to this Agreement, comply with the Data Privacy Laws applicable to it.',
      '8.3 You agree that:',
      '8.3.1 in respect of sending Customer Emails and/or SMS , we act as your Processor; and',
      '8.3.2 in respect of Feedback, we act as a Controller in our own right.',
      '8.4 Both parties agree that where we Process Customer Data as Processor pursuant to clause 8.3:',
      '8.4.1 the subject matter of the processing is the sending of emails and/or SMS;',
      '8.4.2 the duration of the processing is the Term;',
      '8.4.3 the nature and purpose of the processing is carrying out market research for the purposes of product development and quality monitoring;',
      '8.4.4 the types of personal data involved are names and email addresses; and',
      '8.4.5 the categories of data subject are your customers.',
      '8.5 Where we Process Customer Data as Processor pursuant to clause 8.3, we will:',
      '8.5.1 procure that appropriate technical and organisational measures are taken against unauthorised or unlawful processing of such Customer Data and against accidental loss or destruction of, or damage to, such Customer Data, taking into account the nature of the Customer Data;',
      '8.5.2 in relation to such Customer Data, act only on your documented instructions as set out in this Agreement or as otherwise documented in writing;',
      '8.5.3 process such Customer Data only to the extent, and in such manner, as is necessary for the purposes of this Agreement;',
      '8.5.4 use reasonable endeavours to ensure the reliability of its Staff with access to such Customer Data and ensure that all such Staff are under obligations of confidentiality in relation to such Customer Data;',
      '8.5.5 only engage a sub contractor to Process Customer Data, or otherwise disclose Customer Data to a sub contractor, if:',
      '8.5.5.1 we have notified you of such intended appointment or disclosure no less than 30 days prior to the sub contractor’s appointment;',
      '8.5.5.2 you have not objected to such appointment within 14 days of receiving such notice.',
      'Where you object to such appointment or disclosure in accordance with clause 8.5.5.2, we will inform you within seven days of such objection whether we will uphold your objection. Where we do not uphold such objection, you may terminate this Agreement immediately by giving us notice;',
      '8.5.6 where appointing a sub contractor pursuant to clause 8.5.5:',
      '8.5.6.1 ensure that such sub contractor complies with Data Privacy Laws;',
      '8.5.6.2 engage such sub contractor on a written agreement giving commitments in relation to the processing of such Customer Data no less onerous than set out in this Agreement; and',
      '8.5.6.3 remain liable to you for the acts of any such sub contractor in relation to such Customer Data;',
      '8.5.7 at your cost and taking into account the nature of the processing and the information available to the Processor, provide you reasonable assistance to assist you in meeting your obligations under Chapter III of the GDPR and Articles 32 to 36 of the GDPR;',
      '8.5.8 only transfer such Customer Data outside the EEA in compliance with Data Privacy Laws;',
      '8.5.9 at your cost, provide you with reasonable information to demonstrate our compliance with this clause 8, and no more than once in 12 consecutive months allow for and contribute to audits conducted by you or your representative (provided that such representative is bound to obligations of confidentiality no less onerous than those found in this Agreement);',
      '8.5.10 notify you if, in our opinion, an instruction given by you breaches the GDPR ; and',
      '8.5.11 delete or return Customer Data (and any copies of Customer Data unless retention is required by applicable law) to you:',
      '8.5.11.1 on termination of this Agreement; or',
      '8.5.11.2 upon your written request (provided that such deletion shall excuse us from our obligations to the extent such request means we are unable to meet them).',
      '8.6 Without prejudice to clause 8.5, each of us will provide such help and co-operation as is reasonably necessary or requested by the other to enable compliance with this clause 8.',
    ],
  },
  {
    title: '9. Suspension and termination',
    paragraphs: [
      '9.1 If you fail to pay any sum due under or are in material breach of any of the terms of this Agreement we may suspend the Services, Support Services and/or provision of Feedback to Google as part of the seller ratings system which displays as “Stars” and/or “Adwords” on Google pending payment in full and/or investigation.',
      '9.2 We may suspend the provision of the Services and/ or Support Services if we are prevented from providing them by circumstances beyond our reasonable control, and where this continues for 28 days or more either party may terminate this Agreement with immediate effect by giving written notice to the other.',
      '9.3 Without affecting any other right or remedy available to it, either party may terminate this Agreement at any time with immediate effect by giving written notice if the other party:',
      '9.3.1 fails to pay any sum due under this Agreement on or before the due date for payment and remains in default not less than 14 days after being notified in writing to make such payment;',
      '9.3.2 commits a material breach of any term of this Agreement and such breach is irremediable or (if such breach is remediable) fails to remedy that breach within a period of 14 days after being notified to do so in writing; or',
      '9.3.3 ceases carrying on business in the normal cause, or calls a meeting of its creditors or makes a proposal for a voluntary arrangement within Part 1 of the Insolvency Act 1986 or for any other composition or scheme of arrangement with (or assignment for the benefit of) its creditors, or is unable to pay its debts within the meaning of section 123 of the Insolvency Act 1986, or if a trustee, receiver, administrative receiver or other similar officer is appointed or a meeting is convened for the purpose of considering a resolution for its winding up (other than for the purpose of a bona fide scheme of solvent amalgamation or reconstruction) or it is the subject of an administration order.',
      '9.4 On the termination of this Agreement for whatever reason:',
      '9.4.1 all rights of either party to make use of the name and/or logo of the other under this Agreement shall immediately cease; and',
      '9.4.2 both parties shall promptly account to the other for all payments due in accordance with this Agreement and you shall immediately pay to us all of our outstanding invoices in respect of Services and Support Services supplied but for which no invoice has been submitted and we may submit an invoice, which shall be payable immediately on receipt.',
      '9.5 Termination of this Agreement for any reason shall not affect the accrued rights of the parties under this Agreement. Any provision of this Agreement that expressly or by implication is intended to come into or continue in force on or after termination shall remain in full force and effect.',
    ],
  },
  {
    title: '10. Limitation of Liability',
    paragraphs: [
      '10.1 Nothing in this Agreement limits or excludes either party’s liability for:',
      '10.1.1 personal injury or death caused by its negligence;',
      '10.1.2 fraud or fraudulent misrepresentation; or',
      '10.1.3 any other liability that may not be lawfully excluded or limited under English law.',
      '10.2 Subject to clause 10.1, neither party will have any liability arising under or in connection with this Agreement for:',
      '10.2.1 any loss of profits or revenues;',
      '10.2.2 any loss of business opportunity;',
      '10.2.3 any loss of goodwill or reputation;',
      '10.2.4 any loss of data; or',
      '10.2.5 any indirect, consequential or special loss.',
      '10.3 Subject to clauses 10.1 and 10.2, our total aggregate liability to you arising under or in connection with this Agreement (regardless of the cause of action or legal theory of liability) will be limited to 150% of the Fees paid to us by you in the Contract Year in which the event (or last in the series of events) giving rise to such liability occurs.',
    ],
  },
  {
    title: '11. Confidentiality',
    paragraphs: [
      '11.1 We shall keep each other’s Confidential Information confidential and, except with the prior written consent of the other, will:',
      '11.1.1 not use or exploit the Confidential Information in any way except for the purpose of exercising its rights or performing its obligations under this Agreement;',
      '11.1.2 not disclose or make available the Confidential Information in whole or in part to any third party, except as expressly permitted by this Agreement; and',
      '11.1.3 apply the same security measures and degree of care to the Confidential Information as it applies to its own confidential information (and which in any event be no less stringent than the measures and care which it is reasonable to expect of a person operating in the same sector or in the same circumstances).',
      '11.2 We may each disclose the other’s Confidential Information to officers, agents, employees and professional advisers who need to know it for the purpose of this Agreement provided that:',
      '11.2.1 it informs each such person of the confidential nature of the Confidential Information; and',
      '11.2.2 it procures that each such person will comply with this clause 11, and it will be liable for the failure of any such person to comply with this clause 11.',
      '11.3 A party may disclose Confidential Information to the extent required by law, any governmental or regulator authority or court or other authority of competent jurisdiction or the rules of a listing authority or stock exchange provided that, to the extent it is legally entitled to do so, it gives the other as much notice of that disclosure as possible and, where notice of disclosure is not prohibited and is given in accordance with this clause 11.3, it takes into account the reasonable requests of the other in relation to the content of that disclosure.',
    ],
  },
  {
    title: '12. Marketing and promotional announcement',
    paragraphs: [
      '12.1 You agree that we may identify you as a client of Check A Review on the Check A Review Website and to other businesses, for instance in a pricing proposal.',
    ],
  },
  {
    title: '13. Notices',
    paragraphs: [
      '13.1 Any notice or other communication given to a party under or in connection this Agreement shall be in writing addressed to the respective party’s address as set out in the Purchase Order (or as otherwise notified from time to time) and delivered by pre‑paid first class post or other next working day delivery service, commercial courier, fax or email.',
      '13.2 Notices or other communications shall be deemed to have been received if sent by pre‑paid first class post, or other next working day delivery service, at 9 am on the second business day after posting, if delivered by commercial courier, on the date and at the time that the courier’s delivery receipt is signed; and if sent by fax or email, one business day after transmission.',
    ],
  },
  {
    title: '14. General',
    paragraphs: [
      '14.1 Except in connection with a corporate re‑organisation or to any successor in title to the business, you shall not, without our prior written consent (not unreasonably withheld or delayed) assign, transfer, charge, mortgage, subcontract or deal in any other manner with all or any of your rights or obligations under this Agreement. We may at any time assign, transfer, charge, mortgage, subcontract or deal in any other manner with any or all of our rights and obligations under this Agreement, provided that we give you prior written notice of such dealing.',
      '14.2 This Agreement constitutes the entire agreement between the parties and supersedes and extinguishes all previous agreements, promises, assurances, warranties, representations and undertaking them, whether written or oral, relating to its subject matter.',
      '14.3 No person who is not a party to this Agreement shall have any right to enforce any term of this Agreement.',
      '14.4 No amendment or addition to this Agreement shall be made unless made in writing and signed by both parties.',
      '14.5 The parties are not partners or in a joint venture and neither party is entitled to act as or represent itself as agent for the other nor to pledge the other’s credit.',
      '14.6 Any failure or delay by either party in enforcing any provision of this Agreement will not be construed as a waiver of any rights under them.',
      '14.7 If any provision or term of this Agreement shall be declared illegal, invalid or unenforceable for any reason whatsoever, such terms or provisions shall be divisible from this Agreement.',
      '14.8 This Agreement and all non‑contractual obligations arising out of or in connection with it are governed by English law and subject to the exclusive jurisdiction of the English courts.',
    ],
  },
  {
    title: '15. Definitions',
    paragraphs: [
      'In these terms and conditions:',
      '15.1 “Brand” has the meaning given to it in clause 4.6;',
      '15.2 “Confidential Information” means all confidential or commercially sensitive information disclosed on or after the date of the Order Form which the person receiving it knows or ought reasonably to know or by its very nature is confidential;',
      '15.3 “Contract Year” means a consecutive period of 12 months beginning on the Commencement Date or an anniversary of the Commencement Date (as the case may be);',
      '15.4 “Customers” means the customers of your business whom you have requested that we contact for Feedback;',
      '15.5 “Customer Data” means the data provided by you to us relating to Customers, which shall include only each Customer’s name, email address, mobile telephone number and the product or service that they purchased from you;',
      '15.6 “Customer Emails” has the meaning given to it in clause 4.5;',
      '15.7 “Data Privacy Laws” the Data Protection Act 1998, the Privacy and Electronic Communications Directive (2002/58/EC), the Privacy and Electronic Communications (EC Directive) Regulations 2003 (SI 2426/2003) (for as long as they are in force), and GDPR and EU PECR (once applicable);',
      '15.8 “EU PECR” means the final EU regulation that results from the “Proposal for a Regulation on Privacy and Electronic Communications” or such other UK legislation which has the purpose of implementing and/or supplementing such regulation in domestic law;',
      '15.9 “Feedback” means the feedback provided to us by Customers relating to your business (including any other data provided with that feedback) and, where relevant, your response;',
      '15.10 “Check A Review Rating” means the product rating and/or service rating, as applicable, prepared by us for you on a daily basis;',
      '15.11 “Feedback Request Limit” means the limit on monthly feedback requests you may send via the Services set out in the Order Form or as adjusted pursuant to clause 5.4;',
      '15.12 “Check A Review Website” means the website to which the domain name resolves;',
      '15.13 “GDPR” means the General Data Protection Regulation (Regulation (EU) 2016/679) or such other UK legislation which has the purpose of implementing and/or supplementing such regulation in domestic law;',
      '15.14 “Intellectual Property Rights” means rights in inventions, patents, copyright and related rights, rights in designs, rights in databases, rights in confidential information (including know‑how and trade secrets) and rights in trade marks, service marks, trade, business and domain names, whether registered or unregistered and all similar or equivalent rights or forms of protection in any part of the world;',
      '15.15 “Order Form” means the agreement between us to which these terms and conditions apply which will include (without limitation) a description of the agreed Services;',
      '15.16 “Payment Date” means the date each month that the Monthly Service Fee and Support Fee are due for payment as set out in the Order Form;',
      '15.17 “Quarter” means a period of three consecutive months beginning on the Commencement Date, and then each period of three consecutive months thereafter;',
      '15.18 “Services” means the ratings and feedback services provided to you by us in accordance with the terms of this Agreement as more particularly described in the Order Form;',
      '15.19 “SMS” means Short Message Service, as such term is commonly understood in the telecommunications industry.',
      '15.20 “Special Conditions” means such terms and conditions that are labelled in the Order Form as special conditions or special terms;',
      '15.21 “Staff” means any persons employed by a party, or any servant, contractor, consultant, agent or suppliers, engaged by the that party to perform any obligations related to this Agreement;',
      '15.22 “Support Services” means the support services provided to you by us a set out in the Order Form; and',
      '15.23 “Term” means the Initial Term (as defined in the Order Form) and any continuation of this Agreement.',
    ],
  },
]

export function TermsOfUseContent() {
  return (
    <LegalScreen>
      {TERMS_SECTIONS.map((section) => (
        <React.Fragment key={section.title}>
          <LegalH2>{section.title}</LegalH2>
          {section.paragraphs.map((paragraph, index) => (
            <LegalP key={`${section.title}-${index}`}>{paragraph}</LegalP>
          ))}
        </React.Fragment>
      ))}
    </LegalScreen>
  )
}
