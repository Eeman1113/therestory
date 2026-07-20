import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Editorial markdown renderer.
 * Kept tight — used for event section bodies and worldContext plaques.
 */
export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 text-[15px] leading-[1.7] text-ink", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: (props) => <p {...omitNode(props)} />,
          a: (props) => {
            const { href, ...rest } = omitNode(props);
            return (
              <a
                {...rest}
                href={href}
                className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noreferrer" : undefined}
              />
            );
          },
          strong: (props) => (
            <strong {...omitNode(props)} className="font-medium text-ink" />
          ),
          em: (props) => <em {...omitNode(props)} className="italic" />,
          ul: (props) => (
            <ul {...omitNode(props)} className="list-disc space-y-1 pl-6" />
          ),
          ol: (props) => (
            <ol {...omitNode(props)} className="list-decimal space-y-1 pl-6" />
          ),
          blockquote: (props) => (
            <blockquote
              {...omitNode(props)}
              className="border-l-2 border-accent/50 pl-4 italic text-ink-muted"
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

// react-markdown passes a `node` prop that HTML elements don't understand;
// strip it before spreading.
function omitNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const { node: _node, ...rest } = props;
  void _node;
  return rest;
}
