import React from 'react';
import { HelpCircle, Megaphone } from 'lucide-react';

type ContentTab = 'announcements' | 'faq';

interface ContentTabsProps {
  activeTab: ContentTab;
  onChange: (tab: ContentTab) => void;
}

const ContentTabs: React.FC<ContentTabsProps> = ({ activeTab, onChange }) => (
  <div className="content-tabs" role="tablist" aria-label="Content type">
    <button
      type="button"
      role="tab"
      aria-selected={activeTab === 'announcements'}
      className={`content-tab${
        activeTab === 'announcements' ? ' content-tab--active' : ''
      }`}
      onClick={() => onChange('announcements')}
    >
      <Megaphone size={15} />
      Announcements
    </button>

    <button
      type="button"
      role="tab"
      aria-selected={activeTab === 'faq'}
      className={`content-tab${activeTab === 'faq' ? ' content-tab--active' : ''}`}
      onClick={() => onChange('faq')}
    >
      <HelpCircle size={15} />
      FAQ
    </button>
  </div>
);

export default ContentTabs;
