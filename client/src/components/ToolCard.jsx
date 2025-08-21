import React, { useCallback, useMemo } from 'react';
import { Badge } from 'antd';
import {
  FileText,
  Download,
  Star,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Merge,
  Split,
  FileDown as Compress,
  Download as Convert,
  Lock as Protect,
  Unlock as UnlockIcon,
  RotateCw as Rotate,
  Type as Watermark,
  Hash as PageNumbers } from
'lucide-react';
import { useNavigate } from 'react-router-dom';

const TOOL_CONFIG = {
  'Merge PDF': {
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one document',
    icon: Merge,
    color: 'blue',
    features: ['Combine multiple files', 'Maintain quality', 'Fast processing'],
    popularity: 95,
    processingTime: '30 seconds',
    users: '2M+',
    premium: false,
    route: '/merge'
  },
  'Split PDF': {
    title: 'Split PDF',
    description: 'Separate PDF into multiple files by pages or ranges',
    icon: Split,
    color: 'green',
    features: ['Split by pages', 'Extract ranges', 'Batch processing'],
    popularity: 87,
    processingTime: '15 seconds',
    users: '1.5M+',
    premium: false,
    route: '/split'
  },
  'Compress PDF': {
    title: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    icon: Compress,
    color: 'orange',
    features: ['Reduce file size', 'Maintain quality', 'Multiple levels'],
    popularity: 92,
    processingTime: '45 seconds',
    users: '3M+',
    premium: false,
    route: '/compress'
  },
  'Protect PDF': {
    title: 'Protect PDF',
    description: 'Add password protection to your PDF documents',
    icon: Protect,
    color: 'red',
    features: ['Password protection', 'Encryption', 'Access control'],
    popularity: 78,
    processingTime: '20 seconds',
    users: '1.2M+',
    premium: true,
    route: '/protect'
  },
  'Unlock PDF': {
    title: 'Unlock PDF',
    description: 'Remove password protection from PDF files',
    icon: UnlockIcon,
    color: 'purple',
    features: ['Remove passwords', 'Batch unlock', 'Secure processing'],
    popularity: 65,
    processingTime: '10 seconds',
    users: '800K+',
    premium: true,
    route: '/unlock'
  },
  'Rotate PDF': {
    title: 'Rotate PDF',
    description: 'Rotate PDF pages to correct orientation',
    icon: Rotate,
    color: 'cyan',
    features: ['90° rotation', '180° rotation', 'Selective pages'],
    popularity: 72,
    processingTime: '8 seconds',
    users: '950K+',
    premium: false,
    route: '/rotate'
  },
  'Watermark': {
    title: 'Add Watermark',
    description: 'Add text or image watermarks to PDF documents',
    icon: Watermark,
    color: 'indigo',
    features: ['Text watermarks', 'Image watermarks', 'Positioning'],
    popularity: 68,
    processingTime: '25 seconds',
    users: '750K+',
    premium: true,
    route: '/watermark'
  },
  'PDF to PowerPoint': {
    title: 'PDF to PowerPoint',
    description: 'Convert PDF presentations to editable PowerPoint files',
    icon: Download,
    color: 'pink',
    features: ['Maintain formatting', 'Editable slides', 'High quality'],
    popularity: 82,
    processingTime: '45 seconds',
    users: '1.8M+',
    premium: true,
    route: '/pdf-to-powerpoint'
  },
  'Word to PDF': {
    title: 'Word to PDF',
    description: 'Convert Word documents to PDF format',
    icon: FileText,
    color: 'blue',
    features: ['Preserve formatting', 'Fast conversion', 'High quality'],
    popularity: 91,
    processingTime: '20 seconds',
    users: '2.2M+',
    premium: false,
    route: '/convert?type=doc-to-pdf'
  },
  'PowerPoint to PDF': {
    title: 'PowerPoint to PDF',
    description: 'Convert PowerPoint presentations to PDF',
    icon: Download,
    color: 'orange',
    features: ['Maintain slides', 'High resolution', 'Fast processing'],
    popularity: 85,
    processingTime: '25 seconds',
    users: '1.9M+',
    premium: false,
    route: '/convert?type=ppt-to-pdf'
  },
  'Excel to PDF': {
    title: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF format',
    icon: Download,
    color: 'green',
    features: ['Preserve data', 'Maintain layout', 'High quality'],
    popularity: 79,
    processingTime: '30 seconds',
    users: '1.6M+',
    premium: false,
    route: '/convert?type=excel-to-pdf'
  },
  'JPG to PDF': {
    title: 'JPG to PDF',
    description: 'Convert JPG images to PDF documents',
    icon: FileText,
    color: 'indigo',
    features: ['Multiple images', 'Custom layout', 'High quality'],
    popularity: 81,
    processingTime: '20 seconds',
    users: '1.7M+',
    premium: false,
    route: '/convert?type=image-to-pdf'
  },
  'Page numbers': {
    title: 'Add Page Numbers',
    description: 'Add page numbers to PDF documents',
    icon: PageNumbers,
    color: 'gray',
    features: ['Custom formatting', 'Multiple styles', 'Positioning'],
    popularity: 63,
    processingTime: '12 seconds',
    users: '700K+',
    premium: false,
    route: '/page-numbers'
  }
};

const getColorClasses = (color) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-100',
      icon: 'text-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      light: 'bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      hover: 'hover:bg-green-100',
      icon: 'text-green-500',
      gradient: 'from-green-500 to-green-600',
      light: 'bg-green-100'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      hover: 'hover:bg-orange-100',
      icon: 'text-orange-500',
      gradient: 'from-orange-500 to-orange-600',
      light: 'bg-orange-100'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      hover: 'hover:bg-red-100',
      icon: 'text-red-500',
      gradient: 'from-red-500 to-red-600',
      light: 'bg-red-100'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      hover: 'hover:bg-purple-100',
      icon: 'text-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      light: 'bg-purple-100'
    },
    cyan: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      text: 'text-cyan-600',
      hover: 'hover:bg-cyan-100',
      icon: 'text-cyan-500',
      gradient: 'from-cyan-500 to-cyan-600',
      light: 'bg-cyan-100'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-600',
      hover: 'hover:bg-indigo-100',
      icon: 'text-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600',
      light: 'bg-indigo-100'
    },
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-600',
      hover: 'hover:bg-teal-100',
      icon: 'text-teal-500',
      gradient: 'from-teal-500 to-teal-600',
      light: 'bg-teal-100'
    },
    pink: {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      text: 'text-pink-600',
      hover: 'hover:bg-pink-100',
      icon: 'text-pink-500',
      gradient: 'from-pink-500 to-pink-600',
      light: 'bg-pink-100'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-600',
      hover: 'hover:bg-yellow-100',
      icon: 'text-yellow-500',
      gradient: 'from-yellow-500 to-yellow-600',
      light: 'bg-yellow-100'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-600',
      hover: 'hover:bg-gray-100',
      icon: 'text-gray-500',
      gradient: 'from-gray-500 to-gray-600',
      light: 'bg-gray-100'
    }
  };

  return colorMap[color] || colorMap.blue;
};

const ToolCard = ({
  tool,
  featured = false,
  compact = false,
  onClick,
  className = '',
  style = {}
}) => {
  const navigate = useNavigate();
  const config = useMemo(() => TOOL_CONFIG[tool], [tool]);
  if (!config) {
    return null;
  }

  const { title, description, icon: Icon, color, features, popularity, processingTime, users, premium, route } = config;
  const colors = useMemo(() => getColorClasses(color), [color]);

  const handleMouseEnter = useCallback(() => {
    if (route && !onClick) {
      const routePath = route.split('?')[0];
      const prefetchMap = {
        '/merge': () => import('@/pages/MergePdfPage'),
        '/split': () => import('@/pages/SplitPdfPage'),
        '/compress': () => import('@/pages/CompressPdfPage'),
        '/convert': () => import('@/pages/ConvertPdfPage'),
        '/protect': () => import('@/pages/ProtectPdfPage'),
        '/unlock': () => import('@/pages/UnlockPdfPage'),
        '/rotate': () => import('@/pages/RotatePdfPage'),
        '/watermark': () => import('@/pages/WatermarkPdfPage'),
        '/page-numbers': () => import('@/pages/PageNumbersPdfPage'),
        '/pdf-to-powerpoint': () => import('@/pages/PdfToPowerPointPage'),
        '/edit': () => import('@/pages/PdfEditorPage'),
        '/organize': () => import('@/pages/OrganizePdfPage'),
        '/download': () => import('@/pages/DownloadPage')
      };
      
      const prefetchFn = prefetchMap[routePath];
      if (prefetchFn) {
        prefetchFn().catch(() => {});
      }
    }
  }, [route, onClick]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(tool);
    } else if (route) {
      navigate(route);
    }
  }, [tool, title, premium, onClick, route, navigate]);

  return (
    <div
      className={`
        group relative bg-white rounded-xl shadow-soft hover:shadow-medium 
        transition-all duration-300 cursor-pointer overflow-hidden
        ${featured ? 'ring-2 ring-primary-500 ring-opacity-30' : ''}
        ${compact ? 'h-48' : 'h-64'}
        ${className}
      `}
      style={style}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}>
      
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative z-10 p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`
              p-2.5 rounded-lg ${colors.light} ${colors.border}
              transition-all duration-300 group-hover:scale-110 group-hover:shadow-soft
            `}>
              <Icon className={`${colors.icon} w-5 h-5`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`
                font-semibold ${compact ? 'text-base' : 'text-lg'}
                text-gray-900 group-hover:text-gray-700 transition-colors
                truncate
              `}>
                {title}
              </h3>
              {!compact &&
              <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-medium text-gray-600">{popularity}%</span>
                  </div>
                  <span className="text-gray-300 text-xs">•</span>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{users}</span>
                  </div>
                </div>
              }
            </div>
          </div>
          
          {premium &&
          <div className="flex-shrink-0">
              <Badge
              count="PRO"
              className="premium-badge"
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                fontSize: '9px',
                fontWeight: 'bold',
                borderRadius: '10px',
                padding: '1px 6px'
              }} />
            
            </div>
          }
        </div>

        <p className={`
          text-gray-600 mb-4 flex-1 leading-relaxed
          ${compact ? 'text-sm line-clamp-2' : 'text-sm line-clamp-3'}
        `}>
          {description}
        </p>

        {!compact && features && features.length > 0 &&
        <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {features.slice(0, 2).map((feature, index) =>
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-gray-50 rounded-md text-gray-600 border border-gray-100">
                  {feature}
                </span>
            )}
              {features.length > 2 &&
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-md text-gray-500 font-medium">
                  +{features.length - 2}
                </span>
            }
            </div>
          </div>
        }

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">{processingTime}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {featured &&
            <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-yellow-600 font-semibold">Featured</span>
              </div>
            }
            
            <button
              className={`
                btn-primary bg-gradient-to-r ${colors.gradient} 
                text-white font-medium py-1.5 px-3 rounded-lg text-xs
                flex items-center space-x-1 transition-all duration-300
                hover:shadow-soft hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              `}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}>
              <span>{compact ? 'Use' : 'Start'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>);

};

export default React.memo(ToolCard);

export { TOOL_CONFIG, getColorClasses };

export const toolCardUtils = {
  getToolConfig: (tool) => {
    return TOOL_CONFIG[tool];
  },

  getAllTools: () => {
    return Object.entries(TOOL_CONFIG).map(([key, config]) => ({
      key,
      ...config
    }));
  },

  getFeaturedTools: () => {
    return Object.entries(TOOL_CONFIG)
      .filter(([_, config]) => config.popularity > 85)
      .map(([key, config]) => ({
        key,
        ...config
      }))
      .sort((a, b) => b.popularity - a.popularity);
  },

  getPremiumTools: () => {
    return Object.entries(TOOL_CONFIG)
      .filter(([_, config]) => config.premium)
      .map(([key, config]) => ({
        key,
        ...config
      }));
  },

  getPopularTools: () => {
    return Object.entries(TOOL_CONFIG)
      .sort((a, b) => b[1].popularity - a[1].popularity)
      .slice(0, 8)
      .map(([key, config]) => ({
        key,
        ...config
      }));
  }
};