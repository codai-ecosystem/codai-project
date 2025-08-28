import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Social media platform configurations
const socialPlatforms = [
  {
    name: 'LinkedIn',
    handle: '@codai-ecosystem',
    url: 'https://linkedin.com/company/codai-ecosystem',
    color: '#0077B5',
    icon: 'linkedin',
    description: 'Professional updates, industry insights, and company news'
  },
  {
    name: 'Twitter/X',
    handle: '@codai_ecosystem',
    url: 'https://twitter.com/codai_ecosystem',
    color: '#1DA1F2',
    icon: 'twitter',
    description: 'Real-time updates, announcements, and AI innovation news'
  },
  {
    name: 'GitHub',
    handle: '@codai-ecosystem',
    url: 'https://github.com/codai-ecosystem',
    color: '#333',
    icon: 'github',
    description: 'Open source projects, code repositories, and technical documentation'
  },
  {
    name: 'YouTube',
    handle: '@codai-ecosystem',
    url: 'https://youtube.com/@codai-ecosystem',
    color: '#FF0000',
    icon: 'youtube',
    description: 'Product demos, tutorials, and AI development insights'
  },
  {
    name: 'Instagram',
    handle: '@codai_ecosystem',
    url: 'https://instagram.com/codai_ecosystem',
    color: '#E4405F',
    icon: 'instagram',
    description: 'Behind-the-scenes content, team highlights, and visual updates'
  },
  {
    name: 'Facebook',
    handle: '@codai.ecosystem',
    url: 'https://facebook.com/codai.ecosystem',
    color: '#1877F2',
    icon: 'facebook',
    description: 'Community discussions, events, and company announcements'
  }
];

// Social sharing utilities
export const generateSocialShareUrls = (title: string, description: string, url: string) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedUrl = encodeURIComponent(url);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=codai_ecosystem`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&t=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
  };
};

// Social media follow component
export const SocialMediaFollow: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-xl font-semibold text-white mb-4">
        {t('social.followUs')}
      </h3>
      <p className="text-gray-300 mb-6">
        {t('social.followDescription')}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {socialPlatforms.map((platform, index) => (
          <motion.a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all duration-300"
            style={{ '--platform-color': platform.color } as React.CSSProperties}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform"
              style={{ backgroundColor: platform.color }}
            >
              <SocialIcon name={platform.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm">{platform.name}</div>
              <div className="text-gray-400 text-xs truncate">{platform.handle}</div>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};

// Social sharing component
export const SocialShareButtons: React.FC<{
  title?: string;
  description?: string;
  url?: string;
}> = ({
  title = 'CODAI - The Ultimate AI Ecosystem',
  description = 'Experience the future of AI-driven business automation',
  url = 'https://codai.ro'
}) => {
    const { t } = useTranslation();
    const shareUrls = generateSocialShareUrls(title, description, url);

    const shareButtons = [
      { name: 'Twitter', url: shareUrls.twitter, icon: 'twitter', color: '#1DA1F2' },
      { name: 'Facebook', url: shareUrls.facebook, icon: 'facebook', color: '#1877F2' },
      { name: 'LinkedIn', url: shareUrls.linkedin, icon: 'linkedin', color: '#0077B5' },
      { name: 'WhatsApp', url: shareUrls.whatsapp, icon: 'whatsapp', color: '#25D366' },
      { name: 'Telegram', url: shareUrls.telegram, icon: 'telegram', color: '#0088CC' },
      { name: 'Email', url: shareUrls.email, icon: 'email', color: '#EA4335' }
    ];

    const handleShare = (platform: string, url: string) => {
      // Track sharing event
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'share', {
          method: platform,
          content_type: 'webpage',
          content_id: 'codai-home'
        });
      }

      window.open(url, '_blank', 'width=600,height=400,noopener,noreferrer');
    };

    return (
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('social.shareThis')}
        </h3>

        <div className="flex flex-wrap gap-3">
          {shareButtons.map((button) => (
            <motion.button
              key={button.name}
              onClick={() => handleShare(button.name, button.url)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-white"
                style={{ backgroundColor: button.color }}
              >
                <SocialIcon name={button.icon} size="sm" />
              </div>
              <span className="text-white text-sm font-medium">{button.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

// Social proof component
export const SocialProof: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { label: 'GitHub Stars', value: '12.5K+', platform: 'GitHub' },
    { label: 'LinkedIn Followers', value: '8.2K+', platform: 'LinkedIn' },
    { label: 'Twitter Followers', value: '15.1K+', platform: 'Twitter' },
    { label: 'Community Members', value: '25K+', platform: 'Discord' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-xl font-semibold text-white mb-4">
        {t('social.communitySupport')}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-300 text-sm">{stat.label}</div>
            <div className="text-gray-400 text-xs mt-1">{stat.platform}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Social icon component
const SocialIcon: React.FC<{ name: string; size?: 'sm' | 'md' | 'lg' }> = ({
  name,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Simplified SVG icons for social platforms
  const icons: Record<string, React.ReactNode> = {
    twitter: (
      <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
    facebook: (
      <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    linkedin: (
      <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    github: (
      <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
    youtube: (
      <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    instagram: (
      <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    whatsapp: (
      <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
      </svg>
    ),
    telegram: (
      <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    email: (
      <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h1.832l8.532 6.399 8.532-6.399h1.832c.904 0 1.636.732 1.636 1.636z" />
      </svg>
    )
  };

  return icons[name] || null;
};

// Social media integration context
export const SocialMediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    // Load social media tracking scripts
    const loadScript = (src: string, id: string) => {
      if (document.getElementById(id)) return;

      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    };

    // Facebook SDK
    loadScript('https://connect.facebook.net/en_US/sdk.js', 'facebook-jssdk');

    // Twitter widgets
    loadScript('https://platform.twitter.com/widgets.js', 'twitter-wjs');

    // LinkedIn insights
    loadScript('https://platform.linkedin.com/in.js', 'linkedin-sdk');

    // Initialize Facebook SDK
    (window as any).fbAsyncInit = function () {
      (window as any).FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };
  }, []);

  return <>{children}</>;
};