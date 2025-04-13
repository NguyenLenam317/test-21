import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-medium mb-4">EcoSense Hanoi</h4>
            <p className="text-neutral-400 text-sm">
              Personalized environmental insights and recommendations exclusively for Hanoi residents.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-neutral-400 text-sm">
              <li>
                <Link href="/">
                  <a className="hover:text-white transition-colors">Dashboard</a>
                </Link>
              </li>
              <li>
                <Link href="/weather">
                  <a className="hover:text-white transition-colors">Weather Forecast</a>
                </Link>
              </li>
              <li>
                <Link href="/health">
                  <a className="hover:text-white transition-colors">Air Quality</a>
                </Link>
              </li>
              <li>
                <Link href="/climate">
                  <a className="hover:text-white transition-colors">Climate Change</a>
                </Link>
              </li>
              <li>
                <Link href="/activities">
                  <a className="hover:text-white transition-colors">Activity Recommendations</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Data Sources</h4>
            <ul className="space-y-2 text-neutral-400 text-sm">
              <li>
                <a 
                  href="https://open-meteo.com" 
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Metro API
                </a>
              </li>
              <li>
                <a 
                  href="https://vietnam.gov.vn/portal/page/portal/English/ministry/ministry_details?p_org_id=150427&p_page_id=553" 
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hanoi Department of Environment
                </a>
              </li>
              <li>
                <a 
                  href="https://nchmf.gov.vn/KttvsiteE/en-US/2/index.html" 
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vietnam Meteorological Service
                </a>
              </li>
            </ul>
            <p className="text-neutral-400 text-xs mt-4">AI-powered features by Groq</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-neutral-700 text-center text-neutral-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} EcoSense Hanoi. All rights reserved.{" "}
            <Link href="/privacy">
              <a className="text-neutral-300 hover:underline">Privacy Policy</a>
            </Link>{" "}
            |{" "}
            <Link href="/terms">
              <a className="text-neutral-300 hover:underline">Terms of Service</a>
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
