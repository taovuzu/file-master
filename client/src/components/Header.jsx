// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Dropdown, Avatar, Badge } from "antd";
import {
  User,
  Bell,
  Settings,
  LogOut,
  Menu as MenuIcon,
  Search,
  FileText,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Globe,
  Download,
  Upload,
  Lock,
  Unlock,
  RotateCw,
  Type,
  Hash,
  Scissors,
  FileDown,
  Merge,
  Split,
  Sparkles,
  Crown,
  HelpCircle,
  Info,
  Shield,
  Users as TeamIcon,
  PenTool,
  Workflow,
  Languages,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "../redux/auth/selectors";
import { toolCardUtils } from "./ToolCard";

const Header = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Complete tool categories based on ToolCard configuration
  const toolCategories = {
    organize: {
      title: "Organize PDF",
      tools: [
        { name: "Merge PDF", path: "/merge", icon: Merge },
        { name: "Split PDF", path: "/split", icon: Split },
        { name: "Organize PDF", path: "/split", icon: FileText },
        { name: "Add Page Numbers", path: "/page-numbers", icon: Hash },
      ],
    },
    optimize: {
      title: "Optimize PDF",
      tools: [{ name: "Compress PDF", path: "/compress", icon: FileDown }],
    },
    convertToPdf: {
      title: "Convert to PDF",
      tools: [
        { name: "Word to PDF", path: "/convert", icon: FileText },
        { name: "PowerPoint to PDF", path: "/convert", icon: Download },
        { name: "Excel to PDF", path: "/convert", icon: Download },
        { name: "JPG to PDF", path: "/convert", icon: FileText },
      ],
    },
    convertFromPdf: {
      title: "Convert from PDF",
      tools: [
        { name: "Convert PDF", path: "/convert", icon: Download },
        { name: "PDF to PowerPoint", path: "/convert", icon: Download },
        { name: "PDF to JPG", path: "/convert", icon: Download },
        { name: "Edit PDF", path: "/convert", icon: FileText },
      ],
    },
    edit: {
      title: "Edit PDF",
      tools: [
        { name: "Rotate PDF", path: "/rotate", icon: RotateCw },
        { name: "Add Watermark", path: "/watermark", icon: Type },
      ],
    },
    security: {
      title: "PDF Security",
      tools: [
        { name: "Protect PDF", path: "/protect", icon: Lock },
        { name: "Unlock PDF", path: "/unlock", icon: Unlock },
      ],
    },
  };

  // User menu items
  const userMenuItems = [
    {
      key: "profile",
      icon: <User className="w-4 h-4" />,
      label: "My Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <Settings className="w-4 h-4" />,
      label: "Account settings",
      onClick: () => navigate("/settings"),
    },
    {
      key: "team",
      icon: <TeamIcon className="w-4 h-4" />,
      label: "Team",
      onClick: () => navigate("/team"),
    },
    {
      key: "signatures",
      icon: <PenTool className="w-4 h-4" />,
      label: "Signatures",
      onClick: () => navigate("/signatures"),
    },
    {
      key: "workflows",
      icon: <Workflow className="w-4 h-4" />,
      label: "Workflows",
      onClick: () => navigate("/workflows"),
    },
    {
      key: "premium",
      icon: <Crown className="w-4 h-4" />,
      label: "Upgrade to Premium",
      onClick: () => navigate("/premium"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogOut className="w-4 h-4" />,
      label: "Log out",
      onClick: () => {
        navigate("/logout");
      },
    },
  ];

  // Company menu items
  const companyMenuItems = [
    {
      key: "products",
      label: "Other products",
      children: [
        {
          key: "iloveimg",
          label: "iLoveIMG",
          description: "Effortless image editing",
          onClick: () => window.open("https://iloveimg.com", "_blank"),
        },
        {
          key: "ilovesign",
          label: "iLoveSign",
          description: "e-Signing made simple",
          onClick: () => window.open("https://ilovesign.com", "_blank"),
        },
        {
          key: "iloveapi",
          label: "iLoveAPI",
          description: "Document automation for developers",
          onClick: () => window.open("https://iloveapi.com", "_blank"),
        },
      ],
    },
    {
      key: "solutions",
      label: "Solutions",
      children: [
        {
          key: "business",
          label: "Business",
          description:
            "Streamlined PDF editing and workflows for business teams",
          onClick: () => navigate("/business"),
        },
      ],
    },
    {
      key: "applications",
      label: "Applications",
      children: [
        {
          key: "desktop",
          label: "Desktop App",
          description: "Available for Mac and Windows",
          onClick: () => navigate("/desktop"),
        },
        {
          key: "mobile",
          label: "Mobile App",
          description: "Available for iOS and Android",
          onClick: () => navigate("/mobile"),
        },
      ],
    },
    {
      key: "general",
      label: "General",
      children: [
        {
          key: "pricing",
          label: "Pricing",
          onClick: () => navigate("/pricing"),
        },
        {
          key: "security",
          label: "Security",
          onClick: () => navigate("/security"),
        },
        {
          key: "features",
          label: "Features",
          onClick: () => navigate("/features"),
        },
        { key: "about", label: "About us", onClick: () => navigate("/about") },
        { type: "divider" },
        { key: "help", label: "Help", onClick: () => navigate("/help") },
        {
          key: "contact",
          label: "Contact",
          onClick: () => navigate("/contact"),
        },
      ],
    },
  ];

  // Language options
  const languageOptions = [
    { key: "en", label: "English", flag: "🇺🇸" },
    { key: "es", label: "Español", flag: "🇪🇸" },
    { key: "fr", label: "Français", flag: "🇫🇷" },
    { key: "de", label: "Deutsch", flag: "🇩🇪" },
    { key: "it", label: "Italiano", flag: "🇮🇹" },
    { key: "pt", label: "Português", flag: "🇵🇹" },
    { key: "ja", label: "日本語", flag: "🇯🇵" },
    { key: "ru", label: "Pусский", flag: "🇷🇺" },
    { key: "ko", label: "한국어", flag: "🇰🇷" },
    { key: "zh-cn", label: "中文 (简体)", flag: "🇨🇳" },
    { key: "zh-tw", label: "中文 (繁體)", flag: "🇹🇼" },
    { key: "ar", label: "العربية", flag: "🇸🇦" },
  ];

  const handleToolClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  // Render tool dropdown menu
  const renderToolDropdown = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 min-w-[800px]">
      <div className="grid grid-cols-3 gap-6">
        {Object.entries(toolCategories).map(([key, category]) => (
          <div key={key} className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              {category.title}
            </h3>
            <ul className="space-y-2">
              {category.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <li key={tool.name}>
                    <button
                      onClick={() => handleToolClick(tool.path)}
                      className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{tool.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <header className="header bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            to="/"
            className="brand flex items-center space-x-3"
            title="FileMaster"
          >
            <div className="p-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FileMaster</h1>
              <p className="text-xs text-gray-500 -mt-1">PDF Tools</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="menu hidden lg:flex items-center space-x-6">
            {/* All PDF Tools Dropdown */}
            <Dropdown
              overlay={renderToolDropdown()}
              trigger={["hover"]}
              placement="bottomLeft"
            >
              <button className="menu--md flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
                <span>All PDF tools</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </Dropdown>

            {/* Convert PDF Dropdown */}
            <Dropdown
              overlay={
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[400px]">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-3">
                        Convert to PDF
                      </h3>
                      <ul className="space-y-2">
                        {toolCategories.convertToPdf.tools.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <li key={tool.name}>
                              <button
                                onClick={() => handleToolClick(tool.path)}
                                className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                              >
                                <Icon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                  {tool.name}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-3">
                        Convert from PDF
                      </h3>
                      <ul className="space-y-2">
                        {toolCategories.convertFromPdf.tools.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <li key={tool.name}>
                              <button
                                onClick={() => handleToolClick(tool.path)}
                                className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                              >
                                <Icon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                  {tool.name}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              }
              trigger={["hover"]}
              placement="bottomLeft"
            >
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
                <span>Convert PDF</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </Dropdown>
          </div>

          {/* Navigation Actions */}
          <div className="nav-actions flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search PDF tools..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-64 text-sm"
              />
            </div>

            {/* User Section */}
            {isLoggedIn ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <button className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <Avatar
                    size={32}
                    className="bg-gradient-to-r from-primary-600 to-primary-700"
                    icon={<User className="w-4 h-4" />}
                  />
                </button>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-4">
                {/* Sign In Button */}
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Sign In
                </button>

                {/* Get Started Button */}
                <button
                  onClick={() => navigate("/home")}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.03] focus:ring-2 focus:ring-primary-400 focus:outline-none"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started</span>
                </button>
              </div>
            )}

            {/* Company Menu */}
            <Dropdown
              overlay={
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px]">
                  <div className="space-y-4">
                    {companyMenuItems.map((section) => (
                      <div key={section.key}>
                        <h3 className="font-semibold text-gray-900 text-sm mb-2">
                          {section.label}
                        </h3>
                        <ul className="space-y-1">
                          {section.children?.map((item) => (
                            <li key={item.key}>
                              <button
                                onClick={item.onClick}
                                className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                              >
                                <span className="text-sm text-gray-700">
                                  {item.label}
                                </span>
                                {item.description && (
                                  <span className="text-xs text-gray-500">
                                    {item.description}
                                  </span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              }
              trigger={["click"]}
              placement="bottomRight"
            >
              <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </Dropdown>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="flex items-center relative">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search PDF tools..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                />
              </div>

              {/* Mobile Tool Categories */}
              <div className="space-y-4">
                {Object.entries(toolCategories).map(([key, category]) => (
                  <div key={key}>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">
                      {category.title}
                    </h3>
                    <div className="space-y-1">
                      {category.tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.name}
                            onClick={() => handleToolClick(tool.path)}
                            className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              {tool.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-200">
                {isLoggedIn ? (
                  <button
                    onClick={handleAuthClick}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handleAuthClick}
                      className="w-full flex items-center justify-center px-4 py-3 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate("/home")}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-glow"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Get Started</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
