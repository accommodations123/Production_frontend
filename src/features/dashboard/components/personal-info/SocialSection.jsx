import { Share2, MessageCircle, Facebook, Instagram } from 'lucide-react';
import { getSocialUrl } from '@/shared/utils/socialUtils';
import { DetailCard } from './DetailCard';
import { InfoField } from './InfoField';

const openSocialLink = (platform, value) => {
  const url = getSocialUrl(platform, value);
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
};

export function SocialSection({ editStates, toggleEdit, isUpdating, formData, handleChange }) {
  return (
    <DetailCard
      title="Social Links & Contacts"
      description="Your external social channels and direct chats"
      icon={Share2}
      isEditing={editStates.social}
      onEdit={() => toggleEdit('social')}
      isUpdating={isUpdating && editStates.social}
    >
      <div className="md:col-span-2">
        <InfoField
          label="WhatsApp Number"
          name="whatsapp"
          value={formData.whatsapp}
          isEditing={editStates.social}
          onChange={handleChange}
          placeholder="1234567890"
          action={(val) => openSocialLink('whatsapp', val)}
          actionIcon={MessageCircle}
          prefix={formData.whatsappCode}
          iso={formData.whatsappIso}
          onPrefixChange={(code, iso) => setFormData((prev) => ({ ...prev, whatsappCode: code, whatsappIso: iso }))}
        />
      </div>
      <InfoField
        label="Facebook Profile"
        name="facebook"
        value={formData.facebook}
        isEditing={editStates.social}
        onChange={handleChange}
        placeholder="username"
        action={(val) => openSocialLink('facebook', val)}
        actionIcon={Facebook}
      />
      <InfoField
        label="Instagram Profile"
        name="instagram"
        value={formData.instagram}
        isEditing={editStates.social}
        onChange={handleChange}
        placeholder="username"
        action={(val) => openSocialLink('instagram', val)}
        actionIcon={Instagram}
      />
    </DetailCard>
  );
}
