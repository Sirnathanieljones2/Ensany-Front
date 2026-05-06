import { FileText } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { blogPosts } from "../data/marketing.js";

export function Blog() {
  const { t } = useApp();

  return (
    <section className="content-list">
      <div className="page-heading">
        <p className="eyebrow">Research</p>
        <h1>{t.pages.blogTitle}</h1>
        <p>{t.pages.blogText}</p>
      </div>
      {blogPosts.map((post) => (
        <article className="post-row" key={post}>
          <FileText size={20} />
          <div>
            <h2>{post}</h2>
            <p>Editorial draft placeholder for the knowledge base.</p>
          </div>
        </article>
      ))}
    </section>
  );
}
