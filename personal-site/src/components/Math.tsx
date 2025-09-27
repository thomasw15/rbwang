"use client";
import { InlineMath, BlockMath } from 'react-katex';

type Props = {
  children: string;
  display?: boolean;
};

export function Math({ children, display = false }: Props) {
  if (display) {
    return <BlockMath math={children} />;
  }
  return <InlineMath math={children} />;
}
