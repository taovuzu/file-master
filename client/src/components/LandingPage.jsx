import React from 'react';
import { 
  FileText, 
  Scissors, 
  FileDown, 
  Lock, 
  Unlock, 
  RotateCw, 
  Type, 
  Download,
  Star,
  Clock,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Shield,
  Sparkles,
  Globe,
  Award
} from 'lucide-react';
import ToolCard from './ToolCard';
import FileUploadZone from './FileUploadZone';
import Button from './Button';

const LandingPage = () => {
  const featuredTools = [
    'merge',
    'compress',
    'split',
    'convert'
  ];

  const allTools = [
    'merge',
    'split', 
    'compress',
    'protect',
    'unlock',
    'rotate',
    'watermark',
    'convert'
  ];

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Private',
      description: 'Your files are encrypted and automatically deleted after processing'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Process your PDFs in seconds with our optimized algorithms'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Works Everywhere',
      description: 'No installation needed. Works on any device with a web browser'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Trusted by Millions',
      description: 'Join millions of users who trust us with their documents'
    }
  ];

  const stats = [
    { number: '50M+', label: 'Files Processed' },
    { number: '2M+', label: 'Happy Users' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 2M+ users worldwide</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              The Complete
              <span className="text-gradient block">PDF Solution</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Transform your PDFs with our powerful online tools. Merge, split, compress, 
              and convert PDFs with ease. No registration required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                variant="primary" 
                size="lg" 
                gradient 
                icon={<FileText className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Start Processing PDFs
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                View All Tools
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Zone */}
          {/* <div className="max-w-4xl mx-auto">
            <FileUploadZone 
              multiple={true}
              maxFiles={5}
              className="mb-16"
            />
          </div> */}
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft"></div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular PDF Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our most popular tools to get started quickly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredTools.map((tool, index) => (
              <ToolCard 
                key={tool} 
                tool={tool} 
                featured={index === 0}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              View All Tools
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose FileMaster?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make PDF processing simple, secure, and lightning fast
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Tools Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete PDF Toolkit
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to work with PDFs, all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allTools.map((tool, index) => (
              <ToolCard 
                key={tool} 
                tool={tool} 
                compact={true}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your PDFs?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join millions of users who trust FileMaster for their PDF needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              icon={<FileText className="w-5 h-5" />}
              className="bg-white text-primary-600 hover:bg-gray-50"
            >
              Start Processing Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
              className="border-white text-white hover:bg-white hover:text-primary-600"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">FileMaster</h3>
                  <p className="text-sm text-gray-400">PDF Tools</p>
                </div>
              </div>
              <p className="text-gray-400">
                The complete PDF solution trusted by millions of users worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Tools</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Merge PDF</li>
                <li>Split PDF</li>
                <li>Compress PDF</li>
                <li>Convert PDF</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>GitHub</li>
                <li>Blog</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FileMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
