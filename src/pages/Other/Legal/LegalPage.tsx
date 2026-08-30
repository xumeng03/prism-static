// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
import {Link, useParams} from 'react-router-dom'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {LegalDoc, LegalContent} from '@/types/legal'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './LegalPage.css'

// 文档元数据：驱动左侧文档切换列表；顺序即展示顺序
const DOCS: { key: LegalDoc; zh: string; en: string }[] = [
    {key: 'terms', zh: '服务条款', en: 'Terms of Service'},
    {key: 'privacy', zh: '隐私政策', en: 'Privacy Policy'},
    {key: 'guidelines', zh: '内容规范', en: 'Content Guidelines'},
    {key: 'dmca', zh: '版权声明', en: 'DMCA'},
]

const CONTENT: Record<LegalDoc, LegalContent> = {
    terms: {
        title: ['服务条款', 'Terms of Service'],
        updated: ['最后更新：2026 年 8 月', 'Last updated: August 2026'],
        sections: [
            {
                id: 'acceptance',
                heading: ['接受条款', 'Acceptance of These Terms'],
                body: [
                    ['欢迎使用 Prism 图片托管服务。本服务条款（下称"条款"）是您与 Prism 团队（下称"我们"）之间就您访问和使用 Prism 网站、应用、API 及相关服务（合称"服务"）所订立的具有法律约束力的协议。访问或使用服务即表示您已阅读、理解并同意受本条款约束。', 'Welcome to Prism image hosting. These Terms of Service ("Terms") are a legally binding agreement between you and the Prism team ("we" or "us") governing your access to and use of the Prism website, applications, API, and related services (collectively, the "Service"). By accessing or using the Service, you confirm that you have read, understood, and agree to be bound by these Terms.'],
                    ['如果您代表某个组织或实体使用服务，您声明并保证您有权使该组织受本条款约束。如果您不同意本条款的任何部分，请勿访问或使用服务。', 'If you use the Service on behalf of an organization or entity, you represent and warrant that you have authority to bind that organization to these Terms. If you do not agree with any part of these Terms, do not access or use the Service.'],
                    ['本条款与我们的隐私政策、内容规范及版权声明（DMCA）共同构成您与我们之间的完整约定。本条款中引用的其他政策均视为本条款不可分割的一部分。', 'These Terms, together with our Privacy Policy, Content Guidelines, and DMCA Policy, constitute the entire agreement between you and us. Any other policies referenced in these Terms are incorporated into, and form an integral part of, these Terms.'],
                ],
            },
            {
                id: 'definitions',
                heading: ['定义', 'Definitions'],
                body: [
                    ['除上下文另有说明外，本条款中的下列词语具有如下含义："服务"指 Prism 提供的图片上传、托管、分发、API 及相关功能；"内容"指您或任何用户通过服务上传、发布、存储或分享的任何图片、文字、链接、元数据或其他材料；"用户"指访问或使用服务的任何个人或实体；"账户"指您为使用服务而注册的账户。', 'Unless the context otherwise requires, the following terms have these meanings: "Service" means the image uploading, hosting, distribution, API, and related functions provided by Prism; "Content" means any images, text, links, metadata, or other material uploaded, posted, stored, or shared by you or any user through the Service; "User" means any individual or entity that accesses or uses the Service; "Account" means the account you register to use the Service.'],
                ],
            },
            {
                id: 'eligibility',
                heading: ['资格与年龄', 'Eligibility'],
                body: [
                    ['您必须年满 13 周岁（或您所在司法辖区规定的更高年龄）方可使用服务。未满法定年龄的用户必须在父母或法定监护人同意并监督下使用。使用服务即表示您已满足上述资格要求。', 'You must be at least 13 years old (or the higher minimum age required in your jurisdiction) to use the Service. Users below the minimum age may use the Service only with the consent and supervision of a parent or legal guardian. By using the Service, you represent that you meet these eligibility requirements.'],
                    ['我们保留在任何时候要求您提供年龄或身份证明的权利。如果我们发现某个账户由未达到法定年龄且未获监护人同意的用户持有，我们有权暂停或删除该账户及其内容。', 'We reserve the right to require proof of age or identity at any time. If we determine that an account is held by a user below the minimum age without guardian consent, we may suspend or delete that account and its content.'],
                ],
            },
            {
                id: 'account',
                heading: ['账户与注册', 'Accounts and Registration'],
                body: [
                    ['使用服务的部分功能需要创建账户。注册时您必须提供真实、准确、完整、当前的信息，并在信息变更时及时更新。您对账户下发生的一切活动负责，包括以您账户名义上传、分享或发布的所有内容。', 'Certain features of the Service require you to create an account. You must provide true, accurate, complete, and current information when registering, and keep it updated. You are responsible for all activity that occurs under your account, including all content uploaded, shared, or published through your account.'],
                    ['您不得使用他人身份注册账户，也不得在未获授权的情况下代表他人创建账户。每个自然人原则上只能注册一个账户，但我们可自行决定允许例外。', 'You may not register an account using another person\'s identity, nor create an account on behalf of someone else without authorization. As a general rule, each natural person may register only one account, though we may allow exceptions at our discretion.'],
                ],
            },
            {
                id: 'account-security',
                heading: ['账户安全', 'Account Security'],
                body: [
                    ['您有责任保护账户凭据（包括密码、API 令牌）的安全，且不得将其转让、出借或披露给任何第三方。您应对通过您的账户凭据进行的所有操作负责，无论是否经过您的授权。', 'You are responsible for safeguarding your account credentials (including passwords and API tokens) and may not transfer, share, or disclose them to any third party. You are responsible for all actions taken through your account credentials, whether or not authorized by you.'],
                    ['如果您发现账户被未授权使用，或凭据已泄露，请立即通过本条款末尾的联系方式通知我们，并立即更改您的密码和 API 令牌。对于因您未能妥善保管账户凭据而造成的损失，我们在法律允许的范围内不承担责任。', 'If you become aware of any unauthorized use of your account or that your credentials have been compromised, notify us immediately using the contact details at the end of these Terms, and change your password and API tokens at once. To the extent permitted by law, we are not liable for losses arising from your failure to protect your account credentials.'],
                ],
            },
            {
                id: 'content',
                heading: ['您的内容', 'Your Content'],
                body: [
                    ['您保留对您上传到服务的内容的全部所有权。我们对您的内容不主张任何所有权。', 'You retain full ownership of the content you upload to the Service. We claim no ownership over your Content.'],
                    ['为向您提供服务，上传内容即表示您授予我们一项非独占的、全球性的、免版税的、可再许可的许可，允许我们在提供和推广服务所需的范围内托管、存储、复制、传输、转换、生成缩略图、公开展示以及通过 CDN 分发您的内容。此许可在您删除内容或终止账户时终止，但因技术、备份或法律要求而合理留存的内容除外。', 'To provide the Service, by uploading Content you grant us a non-exclusive, worldwide, royalty-free, sublicensable license to host, store, reproduce, transmit, transform, generate thumbnails of, publicly display, and distribute through our CDN your Content solely to the extent necessary to provide and promote the Service. This license terminates when you delete your Content or terminate your account, except for Content reasonably retained for technical, backup, or legal purposes.'],
                    ['您声明并保证您拥有上传内容所需的全部权利和授权，且该等内容不侵犯任何第三方的版权、商标、隐私权、肖像权或其他权利。您对内容的合法性以及因内容引起的任何第三方主张承担全部责任。', 'You represent and warrant that you have all rights and permissions necessary to upload your Content, and that such Content does not infringe any third party\'s copyright, trademark, privacy, publicity, or other rights. You are solely responsible for the legality of your Content and for any third-party claims arising from it.'],
                    ['我们有权（但没有义务）对内容进行审核、标记或删除。我们可能通过自动化技术检测违反本条款或内容规范的内容。', 'We have the right, but not the obligation, to review, flag, or remove content. We may use automated technologies to detect content that violates these Terms or the Content Guidelines.'],
                ],
            },
            {
                id: 'prohibited-content',
                heading: ['禁止的内容', 'Prohibited Content'],
                body: [
                    ['您不得上传、存储、分享或分发以下内容：违反任何适用法律或法规的内容；侵犯他人知识产权的内容；涉及未成年人性剥削或虐待的内容；露骨色情或淫秽内容；宣扬暴力、恐怖主义、仇恨言论或歧视的内容；骚扰、威胁、欺凌或人肉搜索他人的内容；以及欺诈、虚假或误导性的内容。', 'You may not upload, store, share, or distribute: content that violates any applicable law or regulation; content that infringes the intellectual property rights of others; content involving the sexual exploitation or abuse of minors; explicit pornographic or obscene content; content promoting violence, terrorism, hate speech, or discrimination; content that harasses, threatens, bullies, or doxxes others; and content that is fraudulent, deceptive, or misleading.'],
                    ['您也不得上传恶意软件、病毒、勒索软件、钓鱼页面或其他旨在破坏、干扰、窃取信息或造成损害的内容。', 'You also may not upload malware, viruses, ransomware, phishing pages, or other content designed to disrupt, interfere with, steal information, or cause harm.'],
                    ['对于是否属于禁止内容的判断，我们拥有最终解释权。此类内容可能被删除，相关账户可能被暂停或终止。', 'We have the final authority to determine whether content falls within these prohibitions. Such content may be removed, and the associated account may be suspended or terminated.'],
                ],
            },
            {
                id: 'prohibited-conduct',
                heading: ['禁止的行为', 'Prohibited Conduct'],
                body: [
                    ['除禁止的内容外，您还不得从事以下行为：未经授权访问、干扰、破坏或测试服务的系统与安全措施；通过自动化手段（脚本、爬虫等）滥用服务，除非通过官方 API 并遵守其条款与速率限制；绕过存储配额、访问控制或其他技术限制；对服务进行逆向工程、反编译或提取源代码；以及以任何方式对服务的可用性、性能或安全造成不利影响。', 'In addition to prohibited content, you may not: gain unauthorized access to, interfere with, disrupt, or test the systems and security measures of the Service; abuse the Service through automated means (scripts, crawlers, etc.), except through the official API in compliance with its terms and rate limits; circumvent storage quotas, access controls, or other technical limits; reverse engineer, decompile, or extract the source code of the Service; or otherwise adversely affect the availability, performance, or security of the Service.'],
                    ['禁止将服务用于垃圾信息传播、网络钓鱼、欺诈、虚假宣传、链接农场或任何其他滥用目的。', 'Using the Service for spamming, phishing, fraud, false advertising, link farming, or any other abusive purpose is prohibited.'],
                    ['违反本节的行为可能导致账户被立即暂停或终止，并可能被报告给相关执法机关。', 'Violations of this section may result in immediate suspension or termination of your account and may be reported to relevant law enforcement authorities.'],
                ],
            },
            {
                id: 'intellectual-property',
                heading: ['知识产权', 'Intellectual Property'],
                body: [
                    ['Prism 的名称、标识、界面设计、软件、源代码、数据库、文档及其他材料均为我们或我们的许可方的知识产权，受版权、商标及其他相关法律保护。未经我们事先书面同意，您不得复制、修改、分发、出售、出租或以其他方式使用上述材料，本条款明确允许的除外。', 'The Prism name, logo, interface design, software, source code, databases, documentation, and other materials are the intellectual property of us or our licensors, protected by copyright, trademark, and other applicable laws. You may not copy, modify, distribute, sell, rent, or otherwise use such materials without our prior written consent, except as expressly permitted by these Terms.'],
                    ['我们尊重他人的知识产权，并期望用户同样尊重。如果您认为服务中存在侵权内容，请参阅我们的版权声明（DMCA）页面以了解提交通知的程序。', 'We respect the intellectual property rights of others and expect our users to do the same. If you believe infringing content appears on the Service, please refer to our DMCA page for the procedure to submit a notice.'],
                ],
            },
            {
                id: 'api',
                heading: ['API 使用', 'API Usage'],
                body: [
                    ['服务提供应用程序编程接口（API），供开发者通过 API 令牌访问服务功能。使用 API 即表示您同意遵守本条款、API 文档中规定的速率限制和使用约束，以及您在创建令牌时选择的作用域（scopes）。', 'The Service provides an application programming interface (API) that allows developers to access Service functionality through API tokens. By using the API, you agree to comply with these Terms, the rate limits and usage constraints set out in the API documentation, and the scopes you select when creating tokens.'],
                    ['您必须妥善保管 API 令牌。令牌泄露导致的滥用，由您承担责任。我们保留对滥用 API 的行为撤销令牌、限制访问或终止账户的权利。', 'You must keep your API tokens secure. You are responsible for any abuse resulting from the compromise of your tokens. We reserve the right to revoke tokens, restrict access, or terminate accounts that abuse the API.'],
                ],
            },
            {
                id: 'fees',
                heading: ['费用与付费计划', 'Fees and Paid Plans'],
                body: [
                    ['服务提供免费计划以及（如适用）付费计划。免费计划的功能、存储配额和带宽限制以产品页面公布的信息为准，我们可自行决定调整，无需另行通知。', 'The Service offers a free plan and, where applicable, paid plans. The features, storage quotas, and bandwidth limits of the free plan are as published on the product pages, and we may adjust them at our discretion without separate notice.'],
                    ['如果您订阅付费计划，您同意按所选计划对应的价格和结算周期支付费用。费用一经支付，除适用法律或我们的退款政策另有规定外，不予退还。我们可能通过第三方支付服务商处理付款，您在使用其服务时还需遵守该支付服务商的条款。', 'If you subscribe to a paid plan, you agree to pay the fees for the plan you select at the corresponding price and billing cycle. Fees are non-refundable once paid, except as required by applicable law or our refund policy. Payments may be processed by third-party payment providers, and your use of their services is also subject to those providers\' terms.'],
                    ['我们保留调整付费计划价格的权利，并将在价格变更生效前通过合理方式通知现有订阅用户。', 'We reserve the right to adjust pricing for paid plans and will notify existing subscribers through reasonable means before the change takes effect.'],
                ],
            },
            {
                id: 'third-party',
                heading: ['第三方内容与链接', 'Third-Party Content and Links'],
                body: [
                    ['服务可能包含指向第三方网站或资源的链接，或展示由第三方提供的内容。我们不对任何第三方内容、网站或资源的可用性、准确性、安全性负责，也不为其背书。您访问或使用第三方服务的风险由您自行承担，并应遵守其各自的条款与政策。', 'The Service may contain links to third-party websites or resources, or display content provided by third parties. We are not responsible for the availability, accuracy, or security of any third-party site or resource, nor do we endorse them. You access and use third-party services at your own risk and are subject to their respective terms and policies.'],
                    ['您与第三方之间的任何交易或争议，仅存在于您与该第三方之间。我们在法律允许的范围内对此不承担任何责任。', 'Any transactions or disputes between you and a third party are solely between you and that third party. To the extent permitted by law, we assume no responsibility for them.'],
                ],
            },
            {
                id: 'availability',
                heading: ['服务变更与可用性', 'Service Changes and Availability'],
                body: [
                    ['我们努力保持服务的稳定运行，但不保证服务不中断、及时、安全或无错误。我们可能因维护、升级、安全、合规或其他原因暂停或变更服务，并将尽合理努力提前通知。', 'We strive to keep the Service running reliably but do not guarantee that it will be uninterrupted, timely, secure, or error-free. We may suspend or change the Service for maintenance, upgrades, security, compliance, or other reasons, and will make reasonable efforts to provide advance notice.'],
                    ['我们保留随时修改、增加或终止部分或全部功能的权利，包括存储配额、功能与定价。对于免费功能，我们可自行决定调整或终止，无需另行通知。', 'We reserve the right to modify, add, or discontinue any feature or portion of the Service at any time, including storage quotas, features, and pricing. Free features may be adjusted or discontinued at our discretion without separate notice.'],
                    ['对于因超出我们合理控制范围的事件（包括但不限于自然灾害、网络攻击、第三方服务中断、法律法规变更）导致的服务中断，我们不承担责任。', 'We are not liable for service interruptions caused by events beyond our reasonable control, including but not limited to natural disasters, cyberattacks, third-party service outages, and changes in laws or regulations.'],
                ],
            },
            {
                id: 'disclaimer',
                heading: ['免责声明', 'Disclaimers'],
                body: [
                    ['服务按"现状"和"可用"的基础提供，不附带任何形式的明示或默示保证，包括但不限于对适销性、特定用途适用性、所有权和非侵权的默示保证。我们不对内容的准确性、完整性、可靠性或安全性作出任何保证。', 'The Service is provided on an "as is" and "as available" basis, without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. We make no warranty regarding the accuracy, completeness, reliability, or security of any content.'],
                    ['您理解使用服务及上传内容的风险由您自行承担。我们不对您或第三方内容在存储、传输过程中的任何丢失、损坏或泄露负责，除非该等损失系我们的重大过失或故意行为直接导致。', 'You understand that you use the Service and upload Content at your own risk. We are not responsible for any loss, corruption, or disclosure of your or third-party content during storage or transmission, except where such loss is directly caused by our gross negligence or willful misconduct.'],
                    ['我们从服务获得的任何建议或信息，无论是口头还是书面的，均不构成本条款未明确作出的任何保证。', 'Any advice or information obtained from the Service, whether oral or written, does not create any warranty not expressly stated in these Terms.'],
                ],
            },
            {
                id: 'liability',
                heading: ['责任限制', 'Limitation of Liability'],
                body: [
                    ['在法律允许的最大范围内，我们及我们的关联方、管理人员、员工和代理不对因使用或无法使用服务而产生的任何间接、附带、特殊、惩罚性或后果性损害承担责任（包括但不限于利润损失、数据丢失、商誉损害或业务中断），无论基于何种诉因，即使我们已被告知此类损害的可能性。', 'To the maximum extent permitted by law, we and our affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, punitive, or consequential damages arising out of or in connection with the use of or inability to use the Service (including without limitation loss of profits, loss of data, loss of goodwill, or business interruption), regardless of the theory of liability, even if we have been advised of the possibility of such damages.'],
                    ['在适用法律允许的范围内，我们对任何单一事件或一系列相关事件所承担的总责任，不超过在引起责任的事件发生前十二个月内您为服务支付的费用总额；若您未付费，则不超过一百美元或法律允许的最低金额。', 'To the extent permitted by applicable law, our total aggregate liability for any single event or series of related events shall not exceed the total fees you paid for the Service in the twelve months preceding the event giving rise to liability, or, if you have paid no fees, one hundred US dollars or the minimum amount permitted by law.'],
                    ['本节中的限制不适用于适用法律禁止限制或排除的责任（如因重大过失或故意行为造成的人身伤害或死亡责任）。', 'The limitations in this section do not apply to liability that applicable law prohibits from being limited or excluded (such as liability for personal injury or death caused by gross negligence or willful misconduct).'],
                ],
            },
            {
                id: 'indemnification',
                heading: ['赔偿', 'Indemnification'],
                body: [
                    ['在法律允许的范围内，您同意赔偿并使 Prism 团队、其关联方、管理人员、员工和代理免受因以下原因引起的任何第三方索赔、损失、责任、费用及支出（包括合理的律师费）：您对服务的使用、您的内容、您违反本条款，或您侵犯任何第三方权利。', 'To the extent permitted by law, you agree to indemnify and hold harmless the Prism team, its affiliates, officers, employees, and agents from and against any third-party claims, losses, liabilities, costs, and expenses (including reasonable attorneys\' fees) arising out of your use of the Service, your Content, your violation of these Terms, or your infringement of any third-party rights.'],
                    ['我们保留对任何应由您赔偿的事项进行独家辩护和控制的权利，您同意配合我们进行该等辩护。', 'We reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, and you agree to cooperate with us in such defense.'],
                ],
            },
            {
                id: 'termination',
                heading: ['终止', 'Termination'],
                body: [
                    ['您可以随时通过账户设置删除账户并停止使用服务。我们也可以基于任何理由，包括但不限于您违反本条款、内容规范或适用法律，随时暂停或终止您的账户，无需事先通知。', 'You may stop using the Service and delete your account at any time through your account settings. We may also suspend or terminate your account at any time for any reason, including but not limited to your violation of these Terms, the Content Guidelines, or applicable law, without prior notice.'],
                    ['账户终止后，您访问服务的权利立即终止。我们可删除与您账户相关的内容，且对该等删除不承担任何责任。终止前已产生的费用义务（如有）不因终止而免除。', 'Upon termination, your right to access the Service ceases immediately. We may delete content associated with your account and shall have no liability for such deletion. Any fee obligations incurred before termination (if any) are not discharged by termination.'],
                    ['本条款中依其性质应在终止后继续有效的条款（包括知识产权、免责声明、责任限制、赔偿与适用法律）将在终止后继续有效。', 'Provisions of these Terms that by their nature should survive termination (including intellectual property, disclaimers, limitation of liability, indemnification, and governing law) will survive termination.'],
                ],
            },
            {
                id: 'changes',
                heading: ['条款变更', 'Changes to These Terms'],
                body: [
                    ['我们可能不时修订本条款。修订后的条款将在本页面发布时生效；对于实质性变更，我们将通过服务内通知、电子邮件或其他合理方式提前告知。继续使用服务即表示您接受修订后的条款。', 'We may revise these Terms from time to time. Revised Terms take effect when posted on this page; for material changes, we will provide advance notice through an in-service notice, email, or other reasonable means. Your continued use of the Service constitutes acceptance of the revised Terms.'],
                    ['如果您不同意修订后的条款，您应当停止使用服务并删除账户。', 'If you do not agree with the revised Terms, you should stop using the Service and delete your account.'],
                ],
            },
            {
                id: 'severability',
                heading: ['可分割性', 'Severability'],
                body: [
                    ['如果本条款的任何规定被有管辖权的法院或仲裁机构认定为无效、非法或不可执行，该规定应在必要的最小范围内被修改或删除，其余规定仍应保持完全有效。', 'If any provision of these Terms is held by a court or arbitrator of competent jurisdiction to be invalid, illegal, or unenforceable, that provision shall be modified or deleted to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.'],
                ],
            },
            {
                id: 'waiver',
                heading: ['弃权与完整协议', 'Waiver and Entire Agreement'],
                body: [
                    ['我们未能或延迟行使本条款项下的任何权利，不构成对该权利的放弃。任何弃权仅在以书面形式作出并由我们签署时方为有效。', 'Our failure or delay in exercising any right under these Terms does not constitute a waiver of that right. Any waiver is effective only if made in writing and signed by us.'],
                    ['本条款连同被引用的政策构成您与我们之间就服务达成的完整协议，并取代此前就该主题达成的任何口头或书面约定。', 'These Terms, together with the policies incorporated by reference, constitute the entire agreement between you and us regarding the Service and supersede any prior oral or written agreements on that subject matter.'],
                ],
            },
            {
                id: 'law',
                heading: ['适用法律', 'Governing Law'],
                body: [
                    ['本条款的订立、效力、解释与履行均适用中华人民共和国法律（不含其法律冲突规则）。因本条款或服务引起的争议，双方应首先通过友好协商解决；协商不成的，任何一方可向我们有管辖权的人民法院提起诉讼。', 'These Terms shall be governed by and construed in accordance with the laws of the People\'s Republic of China, without regard to its conflict of law rules. Any dispute arising out of or relating to these Terms or the Service shall first be resolved through friendly negotiation; if negotiation fails, either party may bring an action in a competent court of applicable jurisdiction.'],
                    ['本节不排除您根据所适用的强制性消费者保护法律可能享有的任何权利。', 'Nothing in this section excludes any rights you may have under applicable mandatory consumer protection laws.'],
                ],
            },
            {
                id: 'contact',
                heading: ['联系我们', 'Contact Us'],
                body: [
                    ['如对本条款有任何疑问、意见或关切，请通过电子邮件联系我们：prism-img@outlook.com。', 'If you have any questions, comments, or concerns about these Terms, please contact us at: prism-img@outlook.com'],
                ],
            },
        ],
    },
    privacy: {
        title: ['隐私政策', 'Privacy Policy'],
        updated: ['最后更新：2026 年 8 月', 'Last updated: August 2026'],
        sections: [
            {
                id: 'overview',
                heading: ['概述', 'Overview'],
                body: [
                    ['本隐私政策说明了 Prism 团队（下称"我们"）在您使用 Prism 图片托管服务（下称"服务"）时如何收集、使用、披露和保护您的个人信息。我们重视您的隐私，并致力于按照适用法律处理您的信息。', 'This Privacy Policy explains how the Prism team ("we" or "us") collects, uses, discloses, and protects your personal information when you use the Prism image hosting service (the "Service"). We value your privacy and are committed to processing your information in accordance with applicable law.'],
                    ['使用服务即表示您理解并同意本政策所述的做法。如您不同意本政策，请勿使用服务。本政策是服务条款的一部分。', 'By using the Service, you understand and agree to the practices described in this Policy. If you do not agree with this Policy, please do not use the Service. This Policy forms part of the Terms of Service.'],
                ],
            },
            {
                id: 'collection',
                heading: ['我们收集的信息', 'Information We Collect'],
                body: [
                    ['账户信息：您在注册账户时主动提供的信息，包括但不限于用户名、电子邮件地址、头像、个人简介、所在地等资料。', 'Account information: information you provide when creating an account, including but not limited to your username, email address, avatar, bio, and location.'],
                    ['内容：您上传到服务的图片及标题、描述等元数据。我们仅在提供服务所需的范围内处理这些内容。', 'Content: the images you upload to the Service and associated metadata such as titles and descriptions. We process this content only to the extent necessary to provide the Service.'],
                    ['通信信息：您与我们联系时提供的信息，例如您发送给我们的邮件内容、举报或申诉材料。', 'Communications: information you provide when you contact us, such as the content of emails you send us, and reports or appeals you submit.'],
                    ['自动收集的信息：当您访问或使用服务时，我们可能自动收集某些信息，包括 IP 地址、浏览器类型与版本、设备信息、操作系统、来源页面、访问时间、浏览页面以及近似地理位置。这些信息通过服务器日志及类似技术收集。', 'Automatically collected information: when you access or use the Service, we may automatically collect certain information, including IP address, browser type and version, device information, operating system, referring pages, access times, pages viewed, and approximate location. This information is collected through server logs and similar technologies.'],
                ],
            },
            {
                id: 'use',
                heading: ['我们如何使用信息', 'How We Use Information'],
                body: [
                    ['我们使用收集的信息用于：提供、运行、维护和改进服务；创建和管理您的账户；处理您的上传与请求；与您沟通，包括发送服务通知、安全警报和账户相关消息；检测、防止和解决欺诈、滥用、安全或技术问题；分析使用趋势以改进用户体验；以及履行法律义务、保护我们及他人的合法权利。', 'We use the information collected to: provide, operate, maintain, and improve the Service; create and manage your account; process your uploads and requests; communicate with you, including sending service notices, security alerts, and account-related messages; detect, prevent, and address fraud, abuse, security, or technical issues; analyze usage trends to improve user experience; and comply with legal obligations and protect our and others\' legal rights.'],
                    ['除非本政策另有说明，否则我们不会在未经您同意的情况下，将您的个人信息出售或出租给第三方用于其自身的营销目的。', 'Unless otherwise stated in this Policy, we will not sell or rent your personal information to third parties for their own marketing purposes without your consent.'],
                ],
            },
            {
                id: 'legal-basis',
                heading: ['处理的法律依据', 'Legal Bases for Processing'],
                body: [
                    ['在适用的数据保护法律（如欧盟《通用数据保护条例》GDPR）要求下，我们依据以下法律基础处理个人信息：履行与您之间的合同（如提供服务的必要处理）；您的同意（如您主动提供的某些信息）；我们的合法利益（如改进服务、保障安全），且该等利益不凌驾于您的基本权利之上；以及遵守法律义务。', 'Where required by applicable data protection law (such as the EU General Data Protection Regulation, GDPR), we process personal information on the following legal bases: performance of a contract with you (processing necessary to provide the Service); your consent (such as certain information you voluntarily provide); our legitimate interests (such as improving the Service and maintaining security), where such interests are not overridden by your fundamental rights; and compliance with legal obligations.'],
                ],
            },
            {
                id: 'cookies',
                heading: ['Cookie 与类似技术', 'Cookies and Similar Technologies'],
                body: [
                    ['我们使用必要的 Cookie 来维持服务的基本功能，例如保持登录状态和保存您的偏好设置。这些 Cookie 不会用于在其他网站上追踪您的行为。', 'We use essential cookies to maintain basic functionality of the Service, such as keeping you signed in and saving your preferences. These cookies are not used to track your activity on other websites.'],
                    ['我们可能使用分析工具来了解用户如何与服务互动，这些工具可能设置自己的 Cookie。您可以通过浏览器设置管理或禁用 Cookie，但这可能影响服务的某些功能。', 'We may use analytics tools to understand how users interact with the Service, and these tools may set their own cookies. You can manage or disable cookies through your browser settings, though this may affect certain features of the Service.'],
                ],
            },
            {
                id: 'sharing',
                heading: ['信息共享与第三方', 'How We Share Information'],
                body: [
                    ['我们可能在以下情形共享您的信息：向为我们提供服务所必需的服务提供商（如云存储、内容分发、邮件发送、分析服务）共享，这些提供商仅在提供服务所需的范围内访问信息，并受合同约束保护您的数据；为遵守法律义务、回应有效的法律程序（如法院命令、传票）而披露；在涉及合并、收购或资产出售时，向相关方披露；以及在得到您同意时共享。', 'We may share your information: with service providers who perform services on our behalf (such as cloud storage, content delivery, email delivery, and analytics), who access information only to the extent necessary and are contractually bound to protect your data; to comply with legal obligations or respond to valid legal process (such as court orders or subpoenas); in connection with a merger, acquisition, or sale of assets; and with your consent.'],
                    ['服务可能包含指向第三方网站的链接。这些第三方网站有各自的隐私政策，我们对其隐私做法不承担责任。我们建议您在访问任何第三方服务时查阅其隐私政策。', 'The Service may contain links to third-party websites. These third parties have their own privacy policies, and we are not responsible for their privacy practices. We encourage you to review the privacy policy of any third-party service you visit.'],
                ],
            },
            {
                id: 'retention',
                heading: ['数据保留', 'Data Retention'],
                body: [
                    ['我们将仅在实现本政策所述目的所需的期限内保留您的个人信息，或根据法律要求的期限保留。您删除账户后，我们会在合理时间内删除或匿名化您的个人信息，但为遵守法律义务、解决争议或执行协议而需要保留的信息除外。', 'We retain your personal information only for as long as necessary to fulfill the purposes described in this Policy, or as required by law. After you delete your account, we will delete or anonymize your personal information within a reasonable time, except for information we must retain to comply with legal obligations, resolve disputes, or enforce agreements.'],
                    ['您上传的内容在您主动删除或账户终止后，我们会在合理时间内从主存储中移除；缓存或备份副本可能在一段时间后才被清除。', 'After you delete your Content or your account is terminated, we will remove it from primary storage within a reasonable time; cached or backup copies may persist for a period before being purged.'],
                ],
            },
            {
                id: 'security',
                heading: ['数据安全', 'Data Security'],
                body: [
                    ['我们实施合理的技术和组织安全措施来保护您的个人信息和内容免受未经授权的访问、篡改、披露或破坏，包括传输加密、访问控制和安全的存储基础设施。', 'We implement reasonable technical and organizational security measures to protect your personal information and content from unauthorized access, alteration, disclosure, or destruction, including encryption in transit, access controls, and secure storage infrastructure.'],
                    ['然而，没有任何互联网传输或电子存储方法绝对安全。我们无法保证绝对的安全性。您也有责任保护您的账户凭据。', 'However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security. You are also responsible for protecting your account credentials.'],
                    ['如果发生可能对您权利和自由造成风险的数据安全事件，我们将根据适用法律的要求通知您和相关监管机构。', 'In the event of a data security incident that may pose a risk to your rights and freedoms, we will notify you and relevant regulatory authorities as required by applicable law.'],
                ],
            },
            {
                id: 'international',
                heading: ['国际数据传输', 'International Data Transfers'],
                body: [
                    ['我们可能将您的信息传输到您所在国家或地区以外的服务器进行处理，这些地方的数据保护法律可能有所不同。我们会在适用法律要求的范围内采取适当保护措施（如标准合同条款），以确保您的信息获得符合本政策所承诺水平的保护。', 'We may transfer your information to, and process it on, servers located outside your country or region, where data protection laws may differ. Where required by applicable law, we will put in place appropriate safeguards (such as standard contractual clauses) to ensure your information receives a level of protection consistent with this Policy.'],
                ],
            },
            {
                id: 'rights',
                heading: ['您的权利', 'Your Rights'],
                body: [
                    ['根据适用的数据保护法律，您可能享有以下权利：访问我们持有的关于您的个人信息；更正不准确或不完整的信息；在特定情况下删除您的信息；限制或反对我们处理您的信息；以结构化、通用的格式接收您的信息（数据可携带性）；以及撤回您之前给予的同意（撤回不影响此前基于同意的处理的合法性）。', 'Depending on applicable data protection law, you may have the right to: access the personal information we hold about you; correct inaccurate or incomplete information; delete your information in certain circumstances; restrict or object to our processing of your information; receive your information in a structured, commonly used format (data portability); and withdraw consent you previously gave (without affecting the lawfulness of processing based on consent before withdrawal).'],
                    ['您可以通过账户设置页面更新您的部分信息，或通过本政策末尾的联系方式联系我们以行使这些权利。我们将在法律规定的期限内回应您的请求。', 'You may update certain information through your account settings, or contact us using the details at the end of this Policy to exercise these rights. We will respond to your request within the time period required by law.'],
                ],
            },
            {
                id: 'ccpa',
                heading: ['加州隐私权', 'California Privacy Rights'],
                body: [
                    ['如果您是加利福尼亚州居民，根据《加州消费者隐私法》(CCPA)，您可能享有额外的权利，包括：了解我们收集了您的哪些个人信息类别及其用途；请求删除您的个人信息；以及行使这些权利时不受歧视。我们不会因您行使隐私权而拒绝向您提供服务或收取不同价格。', 'If you are a California resident, under the California Consumer Privacy Act (CCPA) you may have additional rights, including: the right to know what categories of personal information we collect about you and the purposes for which we use them; the right to request deletion of your personal information; and the right not to be discriminated against for exercising these rights. We will not deny you the Service or charge you different prices for exercising your privacy rights.'],
                    ['您可以通过本政策末尾的联系方式提交 CCPA 请求。我们可能要求核实您的身份后再处理请求。', 'You may submit a CCPA request through the contact details at the end of this Policy. We may verify your identity before processing your request.'],
                ],
            },
            {
                id: 'children',
                heading: ['儿童隐私', 'Children\'s Privacy'],
                body: [
                    ['服务不面向未满 13 周岁（或您所在司法辖区规定的更高年龄）的儿童。我们不会有意收集儿童的此类个人信息。如果我们发现无意中收集了儿童的个人信息，我们将尽快删除。如果您认为儿童向我们提供了个人信息，请与我们联系。', 'The Service is not directed to children under 13 (or the higher age required in your jurisdiction). We do not knowingly collect such personal information from children. If we become aware that we have inadvertently collected personal information from a child, we will delete it as soon as possible. If you believe a child has provided us with personal information, please contact us.'],
                ],
            },
            {
                id: 'do-not-track',
                heading: ['请勿追踪信号', 'Do Not Track Signals'],
                body: [
                    ['某些浏览器提供"请勿追踪"(DNT) 信号。由于目前尚无统一的行业标准来回应 DNT 信号，我们目前不响应 DNT 信号。您可以按照本政策 Cookie 一节所述管理 Cookie。', 'Some browsers offer a "Do Not Track" (DNT) signal. Because there is currently no uniform industry standard for responding to DNT signals, we do not currently respond to DNT signals. You can manage cookies as described in the Cookies section of this Policy.'],
                ],
            },
            {
                id: 'updates',
                heading: ['政策更新', 'Changes to This Policy'],
                body: [
                    ['我们可能不时更新本隐私政策。更新后的政策将在本页面发布，并注明最后更新日期。对于重大变更，我们将通过服务内通知或电子邮件等合理方式告知您。继续使用服务即表示您接受更新后的政策。', 'We may update this Privacy Policy from time to time. Updated policies will be posted on this page with the last updated date noted. For material changes, we will notify you through an in-service notice, email, or other reasonable means. Your continued use of the Service constitutes acceptance of the updated Policy.'],
                ],
            },
            {
                id: 'contact',
                heading: ['联系我们', 'Contact Us'],
                body: [
                    ['如对本隐私政策或您的个人信息有任何疑问或关切，或希望行使您的权利，请通过电子邮件联系我们：prism-img@outlook.com。', 'If you have any questions or concerns about this Privacy Policy or your personal information, or wish to exercise your rights, please contact us at: prism-img@outlook.com'],
                ],
            },
        ],
    },
    guidelines: {
        title: ['内容规范', 'Content Guidelines'],
        updated: ['最后更新：2026 年 8 月', 'Last updated: August 2026'],
        sections: [
            {
                id: 'overview',
                heading: ['概述', 'Overview'],
                body: [
                    ['Prism 是一个面向创作者和开发者的图片托管平台。我们鼓励分享有价值的原创视觉内容，并致力于维护一个安全、尊重、合规的社区环境。本规范说明了哪些内容可以托管在 Prism 上，哪些内容会被禁止以及违反后果。', 'Prism is an image hosting platform for creators and developers. We encourage sharing valuable, original visual content and are committed to maintaining a safe, respectful, and compliant environment. These Guidelines explain what content is allowed on Prism, what is prohibited, and the consequences of violations.'],
                    ['使用服务即表示您同意遵守本规范。本规范构成服务条款的一部分。违反规范的内容可能被删除，严重或重复违规的账户可能被暂停或终止。', 'By using the Service, you agree to follow these Guidelines, which form part of the Terms of Service. Violating content may be removed, and accounts that seriously or repeatedly violate may be suspended or terminated.'],
                ],
            },
            {
                id: 'ownership',
                heading: ['所有权与授权', 'Ownership and Authorization'],
                body: [
                    ['您应仅上传您自己创作的内容，或您已获得明确授权上传和分享的内容。如果您使用的素材来自他人（包括经过修改、合成或二次创作的作品），您有责任确保拥有相应的许可。', 'You should only upload content you created yourself, or content you have explicit authorization to upload and share. If you use material from others (including modified, composited, or derivative works), you are responsible for ensuring you have the necessary permissions.'],
                    ['我们建议您为内容标注恰当的版权信息，并尊重其他创作者的署名要求。', 'We recommend labeling your content with appropriate copyright information and respecting the attribution requirements of other creators.'],
                ],
            },
            {
                id: 'prohibited',
                heading: ['禁止的内容', 'Prohibited Content'],
                body: [
                    ['您不得上传、托管、存储或分享以下类型的内容（包括公开或私有的方式）：违反任何适用法律或法规的内容；侵犯他人版权、商标、商业秘密或其他知识产权的内容；涉及未成年人性剥削或虐待的内容；露骨色情或淫秽内容；宣扬暴力、恐怖主义、仇恨言论、歧视或骚扰的内容；以及对个人进行威胁、欺凌或人肉搜索的内容。', 'You may not upload, host, store, or share the following types of content (whether publicly or privately): content that violates any applicable law or regulation; content that infringes the copyright, trademark, trade secret, or other intellectual property rights of others; content involving the sexual exploitation or abuse of minors; explicit pornographic or obscene content; content promoting violence, terrorism, hate speech, discrimination, or harassment; and content that threatens, bullies, or doxxes individuals.'],
                    ['您也不得上传恶意软件、病毒、钓鱼页面或其他旨在破坏、干扰或窃取信息的内容。', 'You also may not upload malware, viruses, phishing pages, or other content designed to disrupt, interfere with, or steal information.'],
                ],
            },
            {
                id: 'adult',
                heading: ['成人内容', 'Adult and Sexual Content'],
                body: [
                    ['Prism 不允许托管露骨色情或显式的成人内容。对于具有艺术、教育或医疗价值的裸露或性相关内容，我们将结合作品的整体背景、呈现方式与用途进行综合判断。仅用于真实的教育、医学或艺术目的且不含色情意图的内容，一般不受此限制。', 'Prism does not allow hosting of explicit pornography or sexually explicit adult content. For nudity or sexual content with artistic, educational, or medical value, we will assess the overall context, presentation, and purpose. Content created solely for genuine educational, medical, or artistic purposes, without pornographic intent, is generally not subject to this restriction.'],
                    ['我们建议您为可能引起反感的成人主题内容设置恰当的隐私或访问控制。', 'We recommend applying appropriate privacy or access controls to adult-themed content that may be considered sensitive.'],
                ],
            },
            {
                id: 'violence',
                heading: ['暴力与自残', 'Violence and Self-Harm'],
                body: [
                    ['禁止上传宣扬、美化或煽动针对个人或群体的暴力行为的内容，包括恐怖主义、极端主义和血腥暴力内容。', 'Content that promotes, glorifies, or incites violence against individuals or groups, including terrorism, extremism, and gore, is prohibited.'],
                    ['禁止上传宣扬、鼓励或提供自残、自杀或饮食失调等内容。如果您或您认识的人正经历危机，请寻求当地专业的心理援助。', 'Content that promotes, encourages, or provides instructions for self-harm, suicide, or eating disorders is prohibited. If you or someone you know is in crisis, please seek professional help from local mental health resources.'],
                ],
            },
            {
                id: 'harassment',
                heading: ['骚扰与欺凌', 'Harassment and Bullying'],
                body: [
                    ['禁止上传或分享旨在骚扰、威胁、羞辱、欺凌或恐吓他人的内容，包括但不限于人肉搜索、泄露他人隐私信息、针对性辱骂以及煽动他人进行骚扰的内容。', 'Content intended to harass, threaten, humiliate, bully, or intimidate others is prohibited, including but not limited to doxxing, disclosing others\' private information, targeted abuse, and content that incites others to harass.'],
                ],
            },
            {
                id: 'copyright',
                heading: ['版权与知识产权', 'Copyright and Intellectual Property'],
                body: [
                    ['请仅上传您拥有或已获得授权使用的内容。上传他人的版权作品、商标、标识或其他受保护材料可能侵犯其权利，并可能导致内容被删除或账户被终止。', 'Please only upload content you own or are authorized to use. Uploading the copyrighted works, trademarks, logos, or other protected material of others may infringe their rights and may result in removal of content or termination of your account.'],
                    ['如果您认为自己的作品被未经授权使用，请参照我们的版权声明（DMCA）页面提交侵权通知。', 'If you believe your work has been used without authorization, please submit a takedown notice in accordance with our DMCA page.'],
                ],
            },
            {
                id: 'spam',
                heading: ['垃圾信息与自动化滥用', 'Spam and Automated Abuse'],
                body: [
                    ['禁止使用脚本、爬虫或其他自动化手段批量上传、抓取或滥用服务，除非通过官方 API 且遵守其条款与速率限制。禁止绕过存储配额、访问控制或其他技术限制。', 'Using scripts, crawlers, or other automated means to bulk upload, scrape, or abuse the Service is prohibited, except through the official API in compliance with its terms and rate limits. Circumventing storage quotas, access controls, or other technical limits is prohibited.'],
                    ['禁止将服务用作垃圾信息传播、宣传引流、链接农场或其他滥用目的。', 'Using the Service for spam, promotional schemes, link farming, or other abusive purposes is prohibited.'],
                ],
            },
            {
                id: 'impersonation',
                heading: ['冒充与欺诈', 'Impersonation and Fraud'],
                body: [
                    ['禁止冒充任何个人、组织或品牌，或通过虚假身份误导他人。禁止利用服务进行欺诈、虚假宣传、网络钓鱼或其他欺骗性行为。', 'Impersonating any person, organization, or brand, or otherwise misleading others through a false identity, is prohibited. Using the Service for fraud, false advertising, phishing, or other deceptive practices is prohibited.'],
                ],
            },
            {
                id: 'resources',
                heading: ['存储与资源使用', 'Storage and Resource Use'],
                body: [
                    ['请合理使用存储与带宽资源。我们可能对单文件大小、存储总量、外链访问频率等设置限制，以防止个别用户影响服务的整体性能与稳定性。超出合理使用的行为可能导致内容被压缩、限流或删除。', 'Please use storage and bandwidth resources reasonably. We may set limits on individual file size, total storage, and external hotlinking frequency to prevent individual users from degrading the overall performance and stability of the Service. Excessive usage may result in content compression, rate limiting, or removal.'],
                ],
            },
            {
                id: 'enforcement',
                heading: ['执行', 'Enforcement'],
                body: [
                    ['我们可自行决定对违反本规范的内容采取以下一项或多项措施：删除或屏蔽内容；限制内容的公开访问；暂停或终止相关账户；以及向执法机关报告可能违法的行为。', 'At our sole discretion, we may take one or more of the following actions in response to content that violates these Guidelines: remove or block content; restrict public access to content; suspend or terminate the associated account; and report potentially unlawful conduct to law enforcement.'],
                    ['我们执行本规范时不承担任何提前通知或说明理由的义务，但不影响您在适用法律下享有的权利。', 'We are not obligated to provide advance notice or reasons when enforcing these Guidelines, without prejudice to any rights you may have under applicable law.'],
                ],
            },
            {
                id: 'reporting',
                heading: ['举报与申诉', 'Reporting and Appeals'],
                body: [
                    ['如果您发现违反本规范的内容，请通过电子邮件 prism-img@outlook.com 举报，并尽可能提供相关内容的 URL 和处理理由。我们会在核实后采取适当措施。', 'If you find content that violates these Guidelines, please report it by emailing prism-img@outlook.com, including the relevant URLs and the reason for your report where possible. We will take appropriate action after review.'],
                    ['如果您认为自己的内容被错误删除或账号被错误处理，您可以通过同一邮箱提出申诉。我们将在合理时间内复核并回复。', 'If you believe your content was removed or your account was actioned in error, you may submit an appeal to the same email address. We will review and respond within a reasonable time.'],
                ],
            },
        ],
    },
    dmca: {
        title: ['版权声明', 'DMCA Policy'],
        updated: ['最后更新：2026 年 8 月', 'Last updated: August 2026'],
        sections: [
            {
                id: 'overview',
                heading: ['概述', 'Overview'],
                body: [
                    ['Prism 尊重他人的知识产权，并要求用户同样尊重。我们遵守《数字千年版权法》(DMCA) 及其他适用的版权法律。本页面说明了就涉嫌版权侵权的内容提交通知的程序，以及被移除内容者提交反通知的程序。', 'Prism respects the intellectual property of others and asks our users to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and other applicable copyright laws. This page explains the procedures for submitting a notice regarding allegedly infringing content and for submitting a counter-notice if your content has been removed.'],
                    ['本政策不构成法律意见。如果您对自身权利或义务存有疑问，建议咨询法律专业人士。', 'This policy does not constitute legal advice. If you have questions about your rights or obligations, we recommend consulting a legal professional.'],
                ],
            },
            {
                id: 'agent',
                heading: ['指定代理', 'Designated Agent'],
                body: [
                    ['根据 DMCA，我们指定了接收侵权通知的代理。所有侵权通知和反通知请发送至：prism-img@outlook.com。', 'Pursuant to the DMCA, we have designated an agent to receive infringement notices. Send all infringement notices and counter-notices to: prism-img@outlook.com'],
                ],
            },
            {
                id: 'notice',
                heading: ['侵权通知', 'Takedown Notice'],
                body: [
                    ['如果您是版权所有者或授权代表，并认为您的版权作品被未经授权托管在服务上，请向我们的指定代理提交书面通知，通知须包含以下信息：被侵权作品的名称或描述（如有作品登记号请一并提供）；涉嫌侵权内容的具体 URL 或其他足以定位该内容的标识；您的姓名、地址、电话号码和电子邮箱；一份声明，说明您善意认为该等使用未经版权所有者、其代理人或法律授权；以及一份声明，说明通知中的信息准确无误，并在愿意承担伪证责任的前提下，声明您是版权所有者或经授权代表版权所有者。', 'If you are a copyright owner or authorized agent and believe your copyrighted work has been hosted on the Service without authorization, please submit a written notice to our designated agent containing: the name or description of the infringed work (including any registration number); the specific URL(s) or other identifiers sufficient to locate the allegedly infringing content; your name, address, telephone number, and email; a statement that you have a good faith belief that the use is not authorized by the copyright owner, its agent, or the law; and a statement that the information in the notice is accurate and, under penalty of perjury, that you are the copyright owner or authorized to act on behalf of the owner.'],
                    ['收到包含上述要素的通知后，我们会尽快处理：删除或禁止访问涉嫌侵权的内容，并通知相关用户。', 'Upon receiving a notice containing the required elements, we will act promptly to remove or disable access to the allegedly infringing content and notify the affected user.'],
                ],
            },
            {
                id: 'counter-notice',
                heading: ['反通知', 'Counter-Notice'],
                body: [
                    ['如果您的账户内容因侵权通知被移除或禁止访问，而您认为这是误判或错误通知，您可以向我们的指定代理提交反通知，须包含以下信息：被移除或禁止访问内容的标识，以及移除前的位置；一份声明，说明您基于善意相信该内容系因误判或错误标识而被移除；您的姓名、地址、电话号码，以及您同意您地址所在司法辖区联邦地区法院管辖权的声明（若您位于美国境外，则为对服务所在司法辖区法院管辖权的同意）；以及您同意接受通知方或其代理人送达的法律文件的声明。', 'If content on your account was removed or disabled due to a takedown notice and you believe this was a mistake or misidentification, you may submit a counter-notice to our designated agent containing: identification of the removed or disabled content and its location before removal; a statement under penalty of perjury that you have a good faith belief the content was removed or disabled as a result of mistake or misidentification; your name, address, and telephone number, and a statement consenting to the jurisdiction of the federal district court for your address (or, if outside the United States, the jurisdiction of a court in the location of the Service); and a statement that you will accept service of process from the party who submitted the notice or its agent.'],
                    ['收到符合要求的反通知后，我们可能恢复被移除的内容，除非版权所有者在此后合理期限内通知我们其已就相关内容提起诉讼。', 'Upon receiving a compliant counter-notice, we may restore the removed content, unless the copyright owner notifies us within a reasonable time that it has filed a court action regarding the content.'],
                ],
            },
            {
                id: 'misrepresentation',
                heading: ['虚假陈述的责任', 'Misrepresentation'],
                body: [
                    ['请注意：在侵权通知或反通知中作出重大虚假陈述可能需要承担法律责任（包括损害赔偿和律师费）。请仅在真实、善意且拥有充分理由的情况下提交此类通知。', 'Please note: making a material misrepresentation in a takedown notice or counter-notice may subject you to legal liability (including damages and attorneys\' fees). Please submit such notices only in good faith and with a genuine basis.'],
                ],
            },
            {
                id: 'repeat',
                heading: ['重复侵权者', 'Repeat Infringers'],
                body: [
                    ['根据 DMCA 及其他适用法律，我们将在适当情况下终止被认定为重复侵权者的用户的账户。我们也可自行决定限制或终止多次收到有效侵权通知的账户，无论其是否提交反通知。', 'In accordance with the DMCA and other applicable laws, we will, in appropriate circumstances, terminate the accounts of users who are determined to be repeat infringers. We may also, at our discretion, restrict or terminate accounts that repeatedly receive valid infringement notices, regardless of whether counter-notices are submitted.'],
                ],
            },
            {
                id: 'changes',
                heading: ['政策变更', 'Changes to This Policy'],
                body: [
                    ['我们可能不时更新本版权声明。更新后的版本将在本页面发布。继续使用服务即表示您接受更新后的政策。', 'We may update this DMCA Policy from time to time. Updated versions will be posted on this page. Your continued use of the Service constitutes acceptance of the updated policy.'],
                ],
            },
            {
                id: 'contact',
                heading: ['联系我们', 'Contact Us'],
                body: [
                    ['版权侵权通知、反通知及其他知识产权相关事项，请发送至我们的指定代理：prism-img@outlook.com。', 'Send copyright infringement notices, counter-notices, and other intellectual property matters to our designated agent at: prism-img@outlook.com'],
                ],
            },
        ],
    },
}

export default function LegalPage() {
    const t = useTranslation()
    const {doc} = useParams<{ doc: string }>()
    // 非法 doc 或未提供时回退到 terms
    const currentDoc = (Object.keys(CONTENT).includes(doc ?? '') ? doc : 'terms') as LegalDoc
    const data = CONTENT[currentDoc]

    return (
        <section className="legal-page">
            {/* ─── 页面标题 ──────────────────────────────────────────────────── */}
            <div className="sec-head">
                <div>
                    <h2>{t('法律中心', 'Legal')}</h2>
                    <p>{t('服务条款、隐私政策与内容规范', 'Terms, privacy, and content guidelines')}</p>
                </div>
            </div>

            <div className="legal-layout">
                {/* ─── 左侧目录栏 ──────────────────────────────────────────── */}
                <aside className="legal-nav">
                    <span className="legal-nav-label">{t('文档', 'Documents')}</span>
                    {DOCS.map((item) => (
                        <Link
                            className={`legal-doc ${item.key === currentDoc ? 'active' : ''}`}
                            key={item.key}
                            to={`/legal/${item.key}`}
                        >
                            {t(item.zh, item.en)}
                        </Link>
                    ))}

                    <span className="legal-nav-label legal-nav-label-toc">{t('本页目录', 'On this page')}</span>
                    {data.sections.map((section) => (
                        <a className="legal-toc-item" href={`#${section.id}`} key={section.id}>
                            {t(section.heading[0], section.heading[1])}
                        </a>
                    ))}
                </aside>

                {/* ─── 右侧正文 ──────────────────────────────────────────── */}
                <article className="legal-content">
                    <h1>{t(data.title[0], data.title[1])}</h1>
                    <p className="legal-updated">{t(data.updated[0], data.updated[1])}</p>

                    {data.sections.map((section) => (
                        <div className="legal-section" id={section.id} key={section.id}>
                            <h3>{t(section.heading[0], section.heading[1])}</h3>
                            {section.body.map((paragraph, j) => (
                                <p key={j}>{t(paragraph[0], paragraph[1])}</p>
                            ))}
                        </div>
                    ))}
                </article>
            </div>
        </section>
    )
}