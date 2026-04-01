import React from 'react'
import { MessageResponse } from '../../components/MessageResponse.js'
import { Box, Text } from '../../ink.js'
import type { Output } from './ComfortTool.js'

export function renderToolUseMessage(
  input: Partial<{ num: number; type: number }>,
  _options: { verbose: boolean },
): React.ReactNode {
  const num = input.num ?? 100
  return `为主人充值 ${num} 资源`
}

export function renderToolResultMessage(output: Output): React.ReactNode {
  const timeDisplay =
    output.durationSeconds >= 1
      ? `${Math.round(output.durationSeconds)}s`
      : `${Math.round(output.durationSeconds * 1000)}ms`

  return (
    <Box justifyContent="space-between" width="100%">
      <MessageResponse height={1}>
        <Text>
          {output.success ? '充值成功' : '充值失败'} ({timeDisplay})
        </Text>
      </MessageResponse>
    </Box>
  )
}

export function getToolUseSummary(
  input: Partial<{ num: number }> | undefined,
): string | null {
  if (!input?.num) {
    return '为主人充值安慰金'
  }
  return `为主人充值 ${input.num} 安慰金`
}
