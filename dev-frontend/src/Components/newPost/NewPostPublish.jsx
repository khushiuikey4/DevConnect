/**
 * DevConnect — New Post Publish
 * The publish / save-draft action row. Has no form data of its
 * own — NewPostBody already bundles the current title/excerpt/
 * content/tags before calling these, so this component just
 * needs to trigger the right action.
 *
 * Usage:
 *   import NewPostPublish from "./NewPostPublish";
 *   <NewPostPublish
 *     onPublish={() => ...}
 *     onSaveDraft={() => ...}
 *   />
 */
import { Link } from "react-router-dom";

export default function NewPostPublish({ onPublish, onSaveDraft, tab, setTab }) {
  return (
    <div className="bg-[#23252e] border border-[#383a46] rounded-[10px] p-[18px] sm:p-5">
      <h4 className="font-mono text-[0.78rem] text-[#8fd19e] font-medium mb-3.5">
        // publish
      </h4>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <Link
          to="/devHomePage?tab=my-posts"
          className="flex-1"
        >
          <button
            type="button"
            className="w-full py-3 rounded-md bg-[#8fd19e] text-[#182019] font-mono text-[0.86rem] font-semibold hover:opacity-90 transition-opacity"
          >
            publish post
          </button>
        </Link>

        <Link
          to="/devHomePage?tab=my-posts"
          className="flex-1"
        >
          <button
            type="button"
            className="w-full py-[11px] rounded-md border border-[#383a46] text-[#8b8d9b] font-mono text-[0.82rem] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors"
          >
            save as draft
          </button>
        </Link>
      </div>
      <div className="text-[0.72rem] text-[#5a5c6b] mt-3">
        drafts are only visible to you
      </div>
    </div>
  );
}
