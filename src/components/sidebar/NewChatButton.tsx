'use client';

/**
 * 新規会話作成ボタン
 */

import { Button } from '@/components/ui/button';

interface NewChatButtonProps {
  onClick: () => void;
}

export function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="w-full"
      variant="outline"
    >
      + 新規会話
    </Button>
  );
}
