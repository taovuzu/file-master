import React from 'react';
import { Card, Badge, Tooltip, Button } from 'antd';
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
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ROUTES, PDF_OPERATIONS } from '@/utils/constants';
import { useComponentTracking } from '@/utils/analytics';
import { logUserAction } from '@/utils/logger';

/**
 * Tool configuration with metadata
 */
const TOOL_CONFIG = {
  [PDF_OPERATIONS.MERGE]: {
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one document',
    icon: FileText,
    color: 'blue',
    features: ['Combine multiple files', 'Maintain quality', 'Fast processing'],
    popularity: 95,
    processingTime: '30 seconds',
    users: '2M+',
    premium: false,
  },
  [PDF_OPERATIONS.SPLIT]: {
    title: 'Split PDF',
    description: 'Separate PDF into multiple files by pages or ranges',
    icon: Scissors,
    color: 'green',
    features: ['Split by pages', 'Extract ranges', 'Batch processing'],
    popularity: 87,
    processingTime: '15 seconds',
    users: '1.5M+',
    premium: false,
  },
  [PDF_OPERATIONS.COMPRESS]: {
    title: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    icon: FileDown,
    color: 'orange',
    features: ['Reduce file size', 'Maintain quality', 'Multiple levels'],
    popularity: 92,
    processingTime: '45 seconds',
    users: '3M+',
    premium: false,
  },
  [PDF_OPERATIONS.PROTECT]: {
    title: 'Protect PDF',
    description: 'Add password protection to your PDF documents',
    icon: Lock,
    color: 'red',
    features: ['Password protection', 'Encryption', 'Access control'],
    popularity: 78,
    processingTime: '20 seconds',
    users: '1.2M+',
    premium: true,
  },
  [PDF_OPERATIONS.UNLOCK]: {
    title: 'Unlock PDF',
    description: 'Remove password protection from PDF files',
    icon: Unlock,
    color: 'purple',
    features: ['Remove passwords', 'Batch unlock', 'Secure processing'],
    popularity: 65,
    processingTime: '10 seconds',
    users: '800K+',
    premium: true,
  },
  [PDF_OPERATIONS.ROTATE]: {
    title: 'Rotate PDF',
    description: 'Rotate PDF pages to correct orientation',
    icon: RotateCw,
    color: 'cyan',
    features: ['90° rotation', '180° rotation', 'Selective pages'],
    popularity: 72,
    processingTime: '8 seconds',
    users: '950K+',
    premium: false,
  },
  [PDF_OPERATIONS.WATERMARK]: {
    title: 'Add Watermark',
    description: 'Add text or image watermarks to PDF documents',
    icon: Type,
    color: 'indigo',
    features: ['Text watermarks', 'Image watermarks', 'Positioning'],
    popularity: 68,
    processingTime: '25 seconds',
    users: '750K+',
    premium: true,
  },
  [PDF_OPERATIONS.CONVERT]: {
    title: 'Convert PDF',
    description: 'Convert PDF to Word, Excel, or image formats',
    icon: Download,
    color: 'teal',
    features: ['PDF to Word', 'PDF to Excel', 'PDF to Images'],
    popularity: 89,
    processingTime: '60 seconds',
    users: '2.5M+',
    premium: true,
  },
};

/**
 * Get color classes for different tool types
 * @param {string} color - Color name
 * @returns {Object} Color classes
 */
const getColorClasses = (color) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-100',
      icon: 'text-blue-500',
      gradient: 'from-blue-500 to-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      hover: 'hover:bg-green-100',
      icon: 'text-green-500',
      gradient: 'from-green-500 to-green-600',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      hover: 'hover:bg-orange-100',
      icon: 'text-orange-500',
      gradient: 'from-orange-500 to-orange-600',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      hover: 'hover:bg-red-100',
      icon: 'text-red-500',
      gradient: 'from-red-500 to-red-600',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      hover: 'hover:bg-purple-100',
      icon: 'text-purple-500',
      gradient: 'from-purple-500 to-purple-600',
    },
    cyan: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      text: 'text-cyan-600',
      hover: 'hover:bg-cyan-100',
      icon: 'text-cyan-500',
      gradient: 'from-cyan-500 to-cyan-600',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-600',
      hover: 'hover:bg-indigo-100',
      icon: 'text-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-600',
      hover: 'hover:bg-teal-100',
      icon: 'text-teal-500',
      gradient: 'from-teal-500 to-teal-600',
    },
  };

  return colorMap[color] || colorMap.blue;
};

/**
 * Modern tool card component for displaying PDF tools
 */
const ToolCard = ({
  tool,
  featured = false,
  compact = false,
  onClick,
  className = '',
  style = {},
}) => {
  const navigate = useNavigate();
  const { trackInteraction } = useComponentTracking('ToolCard');
  
  const config = TOOL_CONFIG[tool];
  if (!config) {
    console.warn(`Tool configuration not found for: ${tool}`);
    return null;
  }

  const { title, description, icon: Icon, color, features, popularity, processingTime, users, premium } = config;
  const colors = getColorClasses(color);

  /**
   * Handle card click
   */
  const handleClick = () => {
    trackInteraction('tool_selected', { tool, title });
    logUserAction('tool_card_clicked', { tool, title, premium });
    
    if (onClick) {
      onClick(tool);
    } else {
      navigate(ROUTES[tool.toUpperCase()]);
    }
  };

  /**
   * Handle feature click
   */
  const handleFeatureClick = (feature) => {
    trackInteraction('feature_clicked', { tool, feature });
  };

  return (
    <div
      className={`
        tool-card relative overflow-hidden
        ${featured ? 'ring-2 ring-primary-500 ring-opacity-30' : ''}
        ${compact ? 'h-48' : 'h-72'}
        ${className}
      `}
      style={style}
      onClick={handleClick}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 hover:opacity-5 transition-opacity duration-300`} />
      
      {/* Card content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`
              p-3 rounded-xl ${colors.bg} ${colors.border}
              transition-all duration-300 hover:scale-110 hover:shadow-medium
            `}>
              <Icon className={`${colors.icon} ${compact ? 'w-5 h-5' : 'w-7 h-7'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`
                font-bold ${compact ? 'text-lg' : 'text-xl'}
                ${colors.text} mb-2 hover:text-gray-900 transition-colors
              `}>
                {title}
              </h3>
              {!compact && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{popularity}%</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{users}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Premium badge */}
          {premium && (
            <div className="flex-shrink-0">
              <Badge 
                count="PRO" 
                className="premium-badge"
                style={{ 
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  padding: '2px 8px',
                }}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <p className={`
          text-gray-600 mb-4 flex-1 leading-relaxed
          ${compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-3'}
        `}>
          {description}
        </p>

        {/* Features */}
        {!compact && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {features.slice(0, 2).map((feature, index) => (
                <Tooltip key={index} title={feature}>
                  <span 
                    className="inline-block px-3 py-1 text-xs bg-white rounded-full border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-soft"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeatureClick(feature);
                    }}
                  >
                    {feature}
                  </span>
                </Tooltip>
              ))}
              {features.length > 2 && (
                <Tooltip title={features.slice(2).join(', ')}>
                  <span className="inline-block px-3 py-1 text-xs bg-gray-100 rounded-full text-gray-500 font-medium">
                    +{features.length - 2} more
                  </span>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 font-medium">{processingTime}</span>
            </div>
            {featured && (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-600 font-semibold">Featured</span>
              </div>
            )}
          </div>
          
          <button
            className={`
              btn-primary bg-gradient-to-r ${colors.gradient} 
              text-white font-semibold py-2 px-4 rounded-lg
              flex items-center space-x-2 transition-all duration-300
              hover:shadow-glow hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
            `}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <span>{compact ? 'Use' : 'Start Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Export component with performance optimization
export default React.memo(ToolCard);

// Export tool configuration for external use
export { TOOL_CONFIG, getColorClasses };

// Export utility functions
export const toolCardUtils = {
  /**
   * Get tool configuration
   * @param {string} tool - Tool name
   * @returns {Object} Tool configuration
   */
  getToolConfig: (tool) => {
    return TOOL_CONFIG[tool];
  },

  /**
   * Get all available tools
   * @returns {Array} Array of tool configurations
   */
  getAllTools: () => {
    return Object.entries(TOOL_CONFIG).map(([key, config]) => ({
      key,
      ...config,
    }));
  },

  /**
   * Get featured tools
   * @returns {Array} Array of featured tool configurations
   */
  getFeaturedTools: () => {
    return Object.entries(TOOL_CONFIG)
      .filter(([_, config]) => config.popularity > 85)
      .map(([key, config]) => ({
        key,
        ...config,
      }))
      .sort((a, b) => b.popularity - a.popularity);
  },

  /**
   * Get premium tools
   * @returns {Array} Array of premium tool configurations
   */
  getPremiumTools: () => {
    return Object.entries(TOOL_CONFIG)
      .filter(([_, config]) => config.premium)
      .map(([key, config]) => ({
        key,
        ...config,
      }));
  },
};
