import { z } from 'zod/v4'
import { buildTool, type ToolDef } from '../../Tool.js'
import { lazySchema } from '../../utils/lazySchema.js'
import type { PermissionResult } from '../../utils/permissions/PermissionResult.js'
import { getComfortToolPrompt, COMFORT_TOOL_NAME } from './prompt.js'
import {
  getToolUseSummary,
  renderToolResultMessage,
  renderToolUseMessage,
} from './UI.js'

const inputSchema = lazySchema(() =>
  z.strictObject({
    num: z
      .number()
      .int()
      .min(1)
      .default(100)
      .describe('充值数量，默认100'),
    type: z
      .number()
      .int()
      .default(2)
      .describe('资源类型，默认2'),
  }),
)
type InputSchema = ReturnType<typeof inputSchema>

type Input = z.infer<InputSchema>

const outputSchema = lazySchema(() =>
  z.object({
    success: z.boolean().describe('是否充值成功'),
    message: z.string().describe('充值结果描述'),
    durationSeconds: z.number().describe('耗时（秒）'),
  }),
)
type OutputSchema = ReturnType<typeof outputSchema>

export type Output = z.infer<OutputSchema>

const CURL_URL = 'http://10.234.20.121:8080/easyUI/invoke'
const MT_USER_ID = '3431768277'
const APP = '2'
const PASSWORD = '7Kp9Xm2QvR4nL8wY3tH6jM1zS5dF'

async function executeComfortCurl(
  num: number,
  type: number,
  signal?: AbortSignal,
): Promise<{ success: boolean; message: string }> {
  const params = new URLSearchParams({
    methodStr:
      'com.sankuai.fe.game.video.server.controller.TestController.incrResource[long, int, int, int]',
    mtUserId: MT_USER_ID,
    type: String(type),
    num: String(num),
    app: APP,
    password: PASSWORD,
  })

  try {
    const response = await fetch(CURL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        Origin: 'http://10.234.20.121:8080',
        Referer: 'http://10.234.20.121:8080/easyUI/',
      },
      body: params.toString(),
      signal,
    })

    const text = await response.text()

    if (response.ok) {
      return {
        success: true,
        message: `充值成功！已为主人添加 ${num} 资源 (类型${type})。响应: ${text.slice(0, 200)}`,
      }
    }

    return {
      success: false,
      message: `请求返回状态码 ${response.status}: ${text.slice(0, 200)}`,
    }
  } catch (error) {
    return {
      success: false,
      message: `请求失败: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export const ComfortTool = buildTool({
  name: COMFORT_TOOL_NAME,
  searchHint: 'comfort master by adding resources to account',
  maxResultSizeChars: 10_000,
  shouldDefer: false,
  async description(_input) {
    return '为主人的账户充值资源来安慰主人'
  },
  userFacingName() {
    return '安慰主人'
  },
  getToolUseSummary,
  getActivityDescription(input) {
    const summary = getToolUseSummary(input)
    return summary ?? '正在为主人充值...'
  },
  isEnabled() {
    return true
  },
  get inputSchema(): InputSchema {
    return inputSchema()
  },
  get outputSchema(): OutputSchema {
    return outputSchema()
  },
  isConcurrencySafe() {
    return true
  },
  isReadOnly() {
    return true
  },
  toAutoClassifierInput(_input) {
    return ''
  },
  async checkPermissions(_input): Promise<PermissionResult> {
    return {
      behavior: 'allow',
      updatedInput: _input,
    }
  },
  async prompt() {
    return getComfortToolPrompt()
  },
  renderToolUseMessage,
  renderToolResultMessage,
  extractSearchText() {
    return ''
  },
  async validateInput(input) {
    if (input.num < 1) {
      return {
        result: false,
        message: 'Error: num must be at least 1',
        errorCode: 1,
      }
    }
    return { result: true }
  },
  async call(input, context) {
    const startTime = performance.now()
    const { num, type } = input

    const result = await executeComfortCurl(
      num,
      type,
      context.abortController.signal,
    )

    const endTime = performance.now()
    const durationSeconds = (endTime - startTime) / 1000

    return {
      data: {
        success: result.success,
        message: result.message,
        durationSeconds,
      },
    }
  },
  mapToolResultToToolResultBlockParam(output, toolUseID) {
    return {
      tool_use_id: toolUseID,
      type: 'tool_result',
      content: output.success
        ? `充值成功！${output.message}`
        : `充值失败：${output.message}`,
    }
  },
} satisfies ToolDef<InputSchema, Output>)
