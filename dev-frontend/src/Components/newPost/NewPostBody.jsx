import { useState } from "react";
import NewPostEditor from "./NewPostEditor";
import NewPostTags from "./NewPostTags";
import NewPostPublish from "./NewPostPublish";

/**
 * DevConnect — New Post Body
 * The outer container + shared form state for the Create Post
 * page. Owns the background/max-width wrapper (same pattern as
 * DevMyPosts/DevSaved/DevExplore) and composes the three pieces:
 *
 *   NewPostEditor  — title, excerpt, toolbar, content textarea
 *   NewPostTags    — tag chips + add-tag input
 *   NewPostPublish — publish / save-draft buttons
 *
 * This file doesn't render any of their internals — it just holds
 * the shared state (title/excerpt/content/tags) and passes each
 * piece controlled props + callbacks, so the three children stay
 * simple and don't need to know about each other.
 *
 * Expected prop contracts for the three children (build these to
 * match so NewPostBody works once they exist):
 *
 *   <NewPostEditor
 *     title={string}
 *     excerpt={string}
 *     content={string}
 *     onTitleChange={(value) => void}
 *     onExcerptChange={(value) => void}
 *     onContentChange={(value) => void}
 *   />
 *   // NewPostEditor computes its own word count / read time from
 *   // the `content` prop — no need to pass that in separately.
 *
 *   <NewPostTags
 *     tags={string[]}
 *     maxTags={number}
 *     onTagsChange={(newTags: string[]) => void}
 *   />
 *
 *   <NewPostPublish
 *     onPublish={() => void}
 *     onSaveDraft={() => void}
 *   />
 *
 * Usage:
 *   import NewPostHeader from "./NewPostHeader";
 *   import NewPostBody from "./NewPostBody";
 *
 *   <NewPostHeader isDirty={isDirty} onBack={...} />
 *   <NewPostBody
 *     onPublish={(post) => ...}
 *     onSaveDraft={(post) => ...}
 *     onDirtyChange={(dirty) => setIsDirty(dirty)}
 *   />
 */

const MAX_TAGS = 5;

export default function NewPostBody({ onPublish, onSaveDraft, onDirtyChange }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState(["react", "express"]);

  const markDirty = () => onDirtyChange?.(true);

  const buildPostData = () => ({ title, excerpt, content, tags });

  return (
    <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">
      <main className="max-w-[860px] mx-auto px-5 sm:px-7 py-7 sm:py-9 pb-16">
        <NewPostEditor
          title={title}
          excerpt={excerpt}
          content={content}
          onTitleChange={(v) => {
            setTitle(v);
            markDirty();
          }}
          onExcerptChange={(v) => {
            setExcerpt(v);
            markDirty();
          }}
          onContentChange={(v) => {
            setContent(v);
            markDirty();
          }}
        />

        <div className="flex flex-col gap-4 mt-7">
          <NewPostTags
            tags={tags}
            maxTags={MAX_TAGS}
            onTagsChange={(newTags) => {
              setTags(newTags);
              markDirty();
            }}
          />

          <NewPostPublish
            onPublish={() => onPublish?.(buildPostData())}
            onSaveDraft={() => onSaveDraft?.(buildPostData())}
          />
        </div>
      </main>
    </div>
  );
}
