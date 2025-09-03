import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">SkillFlip</h3>
            <p className="text-gray-600 mb-4">
              Connecting learners with local experts to master new skills and build communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">For Learners</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/browse">
                  <span className="text-gray-600 hover:text-primary transition-colors cursor-pointer">
                    Browse Skills
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/flip-nights">
                  <span className="text-gray-600 hover:text-primary transition-colors cursor-pointer">
                    Flip Nights
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="text-gray-600 hover:text-primary transition-colors cursor-pointer">
                    How It Works
                  </span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  Safety Guidelines
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">For Creators</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/list-skill">
                  <span className="text-gray-600 hover:text-primary transition-colors cursor-pointer">
                    List Your Skill
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard">
                  <span className="text-gray-600 hover:text-primary transition-colors cursor-pointer">
                    Creator Dashboard
                  </span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  Creator Resources
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">&copy; 2024 SkillFlip. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
