interface Props {
  text: string;
  className?: string;
}

export default function QuestionRenderer({ text, className = '' }: Props) {
  // Parse special content tags into React elements
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // [emphasize]text[/emphasize]
    const emMatch = remaining.match(/^([\s\S]*?)\[emphasize\]([\s\S]*?)\[\/emphasize\]/);
    if (emMatch) {
      if (emMatch[1]) parts.push(<span key={key++}>{emMatch[1]}</span>);
      parts.push(
        <strong key={key++} className="font-bold text-noey-dark">
          {emMatch[2]}
        </strong>
      );
      remaining = remaining.slice(emMatch[0].length);
      continue;
    }

    // [hide]word[/hide]
    const hideMatch = remaining.match(/^([\s\S]*?)\[hide\]([\s\S]*?)\[\/hide\]/);
    if (hideMatch) {
      if (hideMatch[1]) parts.push(<span key={key++}>{hideMatch[1]}</span>);
      parts.push(
        <span key={key++} className="inline-block border-b-2 border-noey-dark px-2 min-w-[3rem] text-center">
          {'_'.repeat(hideMatch[2].length)}
        </span>
      );
      remaining = remaining.slice(hideMatch[0].length);
      continue;
    }

    // [blank]
    const blankMatch = remaining.match(/^([\s\S]*?)\[blank\]/);
    if (blankMatch) {
      if (blankMatch[1]) parts.push(<span key={key++}>{blankMatch[1]}</span>);
      parts.push(
        <span key={key++} className="inline-block border-b-2 border-noey-dark px-4 min-w-[4rem]">
          &nbsp;
        </span>
      );
      remaining = remaining.slice(blankMatch[0].length);
      continue;
    }

    // No more tags — render the rest as plain text
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return <p className={className}>{parts}</p>;
}