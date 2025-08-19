import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Dropdown, Avatar, Badge } from "antd";
import {
  User,
  Settings,
  LogOut,
  Menu as MenuIcon,
  Search,
  FileText,
  ChevronDown,
  MoreHorizontal,
  Download,
  Lock,
  Unlock,
  RotateCw,
  Type,
  Hash,
  FileDown,
  Merge,
  Split,
  Sparkles,
  Crown,
  Users as TeamIcon,
  PenTool,
  Workflow } from
"lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "../redux/auth/selectors";

const Header = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  const toolCategories = useMemo(() => ({
    optimize: {
      title: "Optimize PDF",
      tools: [{ name: "Compress PDF", path: "/compress", icon: FileDown }]
    },
    convertToPdf: {
      title: "Convert to PDF",
      tools: [
      { name: "Word to PDF", path: "/convert", icon: FileText },
      { name: "PowerPoint to PDF", path: "/convert", icon: Download },
      { name: "Excel to PDF", path: "/convert", icon: Download },
      { name: "JPG to PDF", path: "/convert", icon: FileText }]
    },
    convertFromPdf: {
      title: "Convert from PDF",
      tools: [
      { name: "Convert PDF", path: "/convert", icon: Download },
      { name: "PDF to PowerPoint", path: "/pdf-to-powerpoint", icon: Download }]
    },
    edit: {
      title: "Edit PDF",
      tools: [
      { name: "Rotate PDF", path: "/rotate", icon: RotateCw },
      { name: "Add Watermark", path: "/watermark", icon: Type }]
    },
    security: {
      title: "PDF Security",
      tools: [
      { name: "Protect PDF", path: "/protect", icon: Lock },
      { name: "Unlock PDF", path: "/unlock", icon: Unlock }]
    }
  }), []);

  const userMenuItems = useMemo(() => [
  {
    key: "profile",
    icon: <User className="w-4 h-4" />,
    label: "My Profile",
    onClick: () => navigate("/profile")
  },
  {
    key: "settings",
    icon: <Settings className="w-4 h-4" />,
    label: "Account settings",
    onClick: () => navigate("/profile")
  },
  { type: "divider" },
  {
    key: "logout",
    icon: <LogOut className="w-4 h-4" />,
    label: "Log out",
    onClick: () => {
      navigate("/logout");
    }
  }], [navigate]);


  const companyMenuItems = [
  // {
  //   key: "products",
  //   label: "Other products",
  //   children: [
  //   {
  //     key: "",
  //     label: "",
  //     description: "",
  //     onClick: () => window.open("", "_blank")
  //   },
  //   {
  //     key: "",
  //     label: "",
  //     description: "",
  //     onClick: () => window.open("", "_blank")
  //   },
  //   {
  //     key: "",
  //     label: "",
  //     description: "",
  //     onClick: () => window.open("", "_blank")
  //   }
  // ]

  // },
  {
    key: "solutions",
    label: "Solutions",
    children: [
    {
      key: "business",
      label: "Business",
      description:
      "Streamlined PDF editing and workflows for business teams",
      onClick: () => navigate("/help")
    }]

  },
  {
    key: "applications",
    label: "Applications",
    children: [
    {
      key: "desktop",
      label: "Desktop App",
      description: "Available for Mac and Windows",
      onClick: () => navigate("/help")
    },
    {
      key: "mobile",
      label: "Mobile App",
      description: "Available for iOS and Android",
      onClick: () => navigate("/help")
    }]

  },
  {
    key: "general",
    label: "General",
    children: [
    {
      key: "help",
      label: "Help Center",
      onClick: () => navigate("/help")
    },
    {
      key: "contact",
      label: "Contact Us",
      onClick: () => navigate("/contact")
    },
    {
      key: "privacy",
      label: "Privacy Policy",
      onClick: () => navigate("/privacy")
    },
    {
      key: "terms",
      label: "Terms of Service",
      onClick: () => navigate("/terms")
    }]

  }];


  const handleToolClick = useCallback((path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const handleAuthClick = useCallback(() => {
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      const from = window.location.pathname + window.location.search;
      navigate(`/login?redirectTo=${encodeURIComponent(from)}`);
    }
  }, [isLoggedIn, navigate]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const allTools = Object.values(toolCategories).flatMap((category) =>
      category.tools.map((tool) => ({ ...tool, category: category.title }))
    );

    const filtered = allTools.filter((tool) =>
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.category.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered);
    setShowSearchResults(true);
  }, [toolCategories]);

  const handleSearchSelect = useCallback((tool) => {
    navigate(tool.path);
    setSearchQuery("");
    setShowSearchResults(false);
  }, [navigate]);

  const renderToolDropdown = useCallback(() =>
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 min-w-[800px]">
      <div className="grid grid-cols-3 gap-6">
        {Object.entries(toolCategories).map(([key, category]) =>
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
                      className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{tool.name}</span>
                    </button>
                  </li>);
              })}
            </ul>
          </div>
        )}
      </div>
    </div>, [toolCategories, handleToolClick]);


  return (
    <header className="header bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {}
          <Link
            to="/home"
            className="brand flex items-center space-x-3"
            title="FileMaster">
            
            <div className="p-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">
                FileMaster
              </h1>
              <p className="text-xs text-gray-500 mt-0 leading-none">
                PDF Tools
              </p>
            </div>
          </Link>

          {}
          <div className="menu hidden lg:flex items-center space-x-6">
            {}
            <Dropdown
              overlay={renderToolDropdown()}
              trigger={["hover"]}
              placement="bottomLeft">
              
              <button className="menu--md flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
                <span>All PDF tools</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </Dropdown>

            {}
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
                              className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                              
                                <Icon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                  {tool.name}
                                </span>
                              </button>
                            </li>);

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
                              className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                              
                                <Icon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                  {tool.name}
                                </span>
                              </button>
                            </li>);

                      })}
                      </ul>
                    </div>
                  </div>
                </div>
              }
              trigger={["hover"]}
              placement="bottomLeft">
              
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
                <span>Convert PDF</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </Dropdown>
          </div>

          {}
          <div className="nav-actions flex items-center space-x-4">
            {}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 w-4 h-4 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="Search PDF tools..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-64 text-sm" />
              
              {showSearchResults && searchResults.length > 0 &&
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={index}
                      onMouseDown={() => handleSearchSelect(tool)}
                      className="flex items-center space-x-3 w-full p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0">
                      
                        <Icon className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                          <div className="text-xs text-gray-500">{tool.category}</div>
                        </div>
                      </button>);

                })}
                </div>
              }
            </div>

            {}
            {isLoggedIn ?
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}>
              
                <button className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <Avatar
                  size={32}
                  className="bg-gradient-to-r from-primary-600 to-primary-700"
                  icon={<User className="w-4 h-4" />} />
                
                </button>
              </Dropdown> :

            <div className="flex items-center gap-4">
                {}
                <button
                onClick={() => {
                  const from = window.location.pathname + window.location.search;
                  navigate(`/login?redirectTo=${encodeURIComponent(from)}`);
                }}
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                
                  Sign In
                </button>

                {}
                <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.03] focus:ring-2 focus:ring-primary-400 focus:outline-none">
                
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started</span>
                </button>
              </div>
            }

            {}
            <Dropdown
              overlay={
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px]">
                  <div className="space-y-4">
                    {companyMenuItems.map((section) =>
                  <div key={section.key}>
                        <h3 className="font-semibold text-gray-900 text-sm mb-2">
                          {section.label}
                        </h3>
                        <ul className="space-y-1">
                          {section.children?.map((item) =>
                      <li key={item.key}>
                              <button
                          onClick={item.onClick}
                          className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                          
                                <span className="text-sm text-gray-700">
                                  {item.label}
                                </span>
                                {item.description &&
                          <span className="text-xs text-gray-500">
                                    {item.description}
                                  </span>
                          }
                              </button>
                            </li>
                      )}
                        </ul>
                      </div>
                  )}
                    <div className="pt-2 border-t border-gray-100">
                      <button
                      onClick={() => navigate('/pricing')}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                      
                        Pricing
                      </button>
                    </div>
                  </div>
                </div>
              }
              trigger={["click"]}
              placement="bottomRight">
              
              <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </Dropdown>

            {}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {}
        {isMobileMenuOpen &&
        <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {}
              <div className="flex items-center relative">
                <Search className="absolute left-3 w-4 h-4 text-gray-400 z-10" />
                <input
                type="text"
                placeholder="Search PDF tools..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm" />
              
                {showSearchResults && searchResults.length > 0 &&
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {searchResults.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSearchSelect(tool)}
                      className="flex items-center space-x-3 w-full p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0">
                      
                          <Icon className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                            <div className="text-xs text-gray-500">{tool.category}</div>
                          </div>
                        </button>);

                })}
                  </div>
              }
              </div>

              {}
              <div className="space-y-4">
                {Object.entries(toolCategories).map(([key, category]) =>
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
                        className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                        
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              {tool.name}
                            </span>
                          </button>);

                  })}
                    </div>
                  </div>
              )}
              </div>

              {}
              <div className="pt-4 border-t border-gray-200">
                {isLoggedIn ?
              <button
                onClick={handleAuthClick}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200">
                
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button> :

              <div className="space-y-2">
                    <button
                  onClick={handleAuthClick}
                  className="w-full flex items-center justify-center px-4 py-3 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200">
                  
                      Sign In
                    </button>
                    <button
                  onClick={() => navigate("/home")}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-glow">
                  
                      <Sparkles className="w-4 h-4" />
                      <span>Get Started</span>
                    </button>
                  </div>
              }
              </div>
            </div>
          </div>
        }
      </nav>
    </header>);

};

export default React.memo(Header);