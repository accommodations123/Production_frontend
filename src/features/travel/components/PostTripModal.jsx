import PostTripForm from './PostTripForm';

/**
 * Thin wrapper so the existing lazy import in travel/page.jsx keeps working.
 * Passes variant="modal" for the red accent styling.
 */
export default function PostTripModal({ onClose, onAdd }) {
  return <PostTripForm variant="modal" onClose={onClose} onAdd={onAdd} />;
}
