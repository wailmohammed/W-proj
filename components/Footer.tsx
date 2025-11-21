
import React, { useState } from 'react';
import { Shield, Lock, FileText, Mail, X, ExternalLink, CheckCircle, HelpCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

type ModalType = 'security' | 'terms' | 'privacy' | 'support' | null;

const FAQS = [
  {
    q: "How does 14-days free trial work?",
    a: "After registration you get full access to all functions of WealthOS. The only exception is – you can add only 2 portfolios. To add more portfolios, you can upgrade to the Investor plan."
  },
  {
    q: "What happens after my free trial ends?",
    a: "You will be automatically switched to Free plan. If you exceed limits of the free plan, you will be asked to upgrade or remove portfolios/holdings. We NEVER remove your data without your permission."
  },
  {
    q: "Do I need to enter my CC info to sign up?",
    a: "No, you don’t need to enter your credit card to start a free trial."
  },
  {
    q: "How does WealthOS handle payments?",
    a: "Crypto handles the payment processing for us. Acceptable payment methods include all major credit card. We guarantee you safe and secure online ordering."
  },
  {
    q: "Can I cancel anytime?",
    a: "You can cancel your subscription at any time and it will not auto-renew after the current paid term. Paid service will remain active for the duration of the paid term."
  },
  {
    q: "Can I change my plan later?",
    a: "Yes, if you decide to switch to another plan after initial purchase you can always do so on Subscription Management page."
  },
  {
    q: "Is WealthOS safe?",
    a: "We understand that you provide us your sensitive data, so we closely monitor its safety. WealthOS DOES NOT store your broker account credentials. All your data in WealthOS is depersonalized and encrypted at rest."
  },
  {
    q: "Where can I find more information about WealthOS?",
    a: "Find answers to the most popular questions, tutorials, and advice on how to use WealthOS via our Knowledge Base."
  }
];

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        {question}
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
};

const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const { switchView } = usePortfolio();

  const closeModal = () => setActiveModal(null);

  const handleVisitHelpCenter = () => {
      closeModal();
      switchView('knowledge-base');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pt-10 pb-6 transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Links Row */}
        <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8 mb-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button onClick={() => setActiveModal('support')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Support & FAQ</button>
          <button onClick={() => setActiveModal('terms')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms & Conditions</button>
          <button onClick={() => setActiveModal('privacy')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy Policy</button>
          <button onClick={() => setActiveModal('security')} className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
            <Shield className="w-4 h-4" /> Security
          </button>
        </div>

        {/* Disclaimer Text */}
        <div className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
          <p>
            WealthOS would like to remind you that the data contained in this website is not necessarily real-time nor accurate. The site and content are provided “as is” and without warranties of any kind. You bear all risks associated with the use of the site and content, including without limitation, any reliance on the accuracy, completeness or usefulness of any content available on the site.
          </p>
          <p>
            The Website should not be relied upon as a substitute for extensive independent market research before making your actual trading decisions. Past performance is not an indicator of future performance. WealthOS is not a registered investment advisor or broker/dealer. Any opinions, charts, messages, news, research, analyses, prices, or other information contained on this Website are provided as general market information for educational and entertainment purposes only, and do not constitute investment advice.
          </p>
          <p>
            Brokerage providers are not affiliated with WealthOS and do not endorse or recommend any information or advice provided by WealthOS.
          </p>
          <p className="pt-2 text-center md:text-left font-bold text-slate-300 dark:text-slate-600">
            &copy; {new Date().getFullYear()} WealthOS Financial Technologies. All rights reserved.
          </p>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-fade-in-up">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {activeModal === 'security' && <Shield className="w-5 h-5 text-emerald-500" />}
                {activeModal === 'terms' && <FileText className="w-5 h-5 text-brand-500" />}
                {activeModal === 'privacy' && <Lock className="w-5 h-5 text-amber-500" />}
                {activeModal === 'support' && <HelpCircle className="w-5 h-5 text-blue-500" />}
                
                {activeModal === 'security' && 'Security & Data Protection'}
                {activeModal === 'terms' && 'Terms & Conditions'}
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'support' && 'Support & Knowledge Base'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
              
              {/* SECURITY CONTENT */}
              {activeModal === 'security' && (
                <>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Your Trust is Our Priority</h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">We implement bank-grade security measures to ensure your financial data remains private and protected at all times.</p>
                    </div>
                  </div>

                  <section>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Data Safety & Monitoring</h4>
                    <p>
                      We understand that you provide us your sensitive data, so we closely monitor its safety. 
                      <strong className="text-slate-900 dark:text-white"> WealthOS DOES NOT have your broker or crypto account credentials.</strong>
                    </p>
                  </section>

                  <section>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Third-Party Aggregation</h4>
                    <p>
                      WealthOS uses third-party financial account aggregator services (like Plaid and Yodlee) to connect to your brokerage accounts. 
                      Your broker credentials are directly sent to the respective service from your browser. Our servers will never see your credentials. 
                      These providers provide a read-only interface to us; therefore we cannot make any transactions on your behalf.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Is my data encrypted?</h4>
                    <p className="mb-2">
                      The data in WealthOS is depersonalized and encrypted in-transit (HTTPS). Depersonalized means that stored data is not connected to you personally.
                    </p>
                    <p>
                      It’s NOT end-to-end encrypted, because it will not allow us to deliver several fundamental features of the service (like portfolio analytics and insights).
                    </p>
                  </section>

                  <section>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">What happens if WealthOS servers are breached?</h4>
                    <p className="mb-2">
                      We don't store any of your broker credentials. If our servers were to be breached, your broker credentials are totally safe.
                    </p>
                    <p>
                      All your data in WealthOS is depersonalized. So, even if someone hacks in and gets hold of a backup of the database, it’d be useless, because they can’t match data with you personally.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Does WealthOS sell my data?</h4>
                    <p>
                      We <strong className="text-slate-900 dark:text-white">NEVER</strong> sell your data. Our service is funded solely by your subscription fee.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Data Deletion & Backups</h4>
                    <p>
                      When you delete your account, we delete all your data from our database immediately and notify our aggregators to stop connecting your account and delete everything from their end. 
                      We keep rotating backups for 30 days. Your data will be removed from the backup in the next backup purge cycle.
                    </p>
                  </section>
                </>
              )}

              {/* TERMS CONTENT */}
              {activeModal === 'terms' && (
                <>
                  <p><strong>Last Updated: October 24, 2023</strong></p>
                  <p>Welcome to WealthOS. By accessing or using our website, mobile application, and services, you agree to be bound by these Terms and Conditions.</p>
                  
                  <h4 className="font-bold text-slate-900 dark:text-white pt-2">1. Acceptance of Terms</h4>
                  <p>By accessing and using WealthOS, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>

                  <h4 className="font-bold text-slate-900 dark:text-white pt-2">2. Description of Service</h4>
                  <p>WealthOS provides users with investment portfolio tracking, analytics, and community features. You understand and agree that the Service may include advertisements and that these advertisements are necessary for WealthOS to provide the Service.</p>

                  <h4 className="font-bold text-slate-900 dark:text-white pt-2">3. Registration</h4>
                  <p>You agree to provide true, accurate, current and complete information about yourself as prompted by the Service's registration form. If you provide any information that is untrue, inaccurate, not current or incomplete, WealthOS has the right to suspend or terminate your account.</p>

                  <h4 className="font-bold text-slate-900 dark:text-white pt-2">4. Investment Disclaimer</h4>
                  <p>WealthOS is not a registered investment, legal or tax advisor or a broker/dealer. All investment/financial opinions expressed by WealthOS are from the personal research and experience of the owners of the site and are intended as educational material. Although best efforts are made to ensure that all information is accurate and up to date, occasionally unintended errors and misprints may occur.</p>
                </>
              )}

              {/* PRIVACY CONTENT */}
              {activeModal === 'privacy' && (
                <>
                  <p><strong>Effective Date: October 24, 2023</strong></p>
                  <p>At WealthOS, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our application.</p>

                  <h4 className="font-bold text-slate-900 dark:text-white pt-2">1. Information We Collect</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number.</li>
                    <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                    <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g. valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services.</li>
                  </ul>

                  <h4 className="font-bold text-slate-900 dark:text-white pt-2">2. Use of Your Information</h4>
                  <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Create and manage your account.</li>
                    <li>Process your payments and refunds.</li>
                    <li>Email you regarding your account or order.</li>
                    <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
                  </ul>

                  <h4 className="font-bold text-slate-900 dark:text-white pt-2">3. Disclosure of Your Information</h4>
                  <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
                    <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
                  </ul>
                </>
              )}

              {/* SUPPORT & FAQ CONTENT */}
              {activeModal === 'support' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl p-5 text-center">
                       <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Mail className="w-6 h-6 text-blue-500" />
                       </div>
                       <h4 className="font-bold text-slate-900 dark:text-white mb-1">Contact Support</h4>
                       <p className="text-xs text-slate-500 mb-4">Our team is available Mon-Fri, 9am - 5pm EST.</p>
                       
                       <a href="mailto:support@wealthos.com" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-colors shadow-lg shadow-brand-600/20">
                          Email Support
                       </a>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl p-5 text-center">
                       <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <BookOpen className="w-6 h-6 text-emerald-500" />
                       </div>
                       <h4 className="font-bold text-slate-900 dark:text-white mb-1">Knowledge Base</h4>
                       <p className="text-xs text-slate-500 mb-4">Tutorials, guides, and platform documentation.</p>
                       
                       <button 
                          onClick={handleVisitHelpCenter}
                          className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> Visit Help Center
                       </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h4>
                    <div className="space-y-1">
                      {FAQS.map((item, i) => (
                        <FAQItem key={i} question={item.q} answer={item.a} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-right">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
