import { PrismaClient } from '@prisma/client'

type FileAttachmentData = {
  messageId?: string | null
  directMessageId?: string | null
  threadReplyId?: string | null
  [key: string]: any
}

export async function validateFileAttachment(
  prisma: PrismaClient,
  data: FileAttachmentData
) {
  const { messageId, directMessageId, threadReplyId } = data
  const attachmentCount = [messageId, directMessageId, threadReplyId].filter(
    (id) => id != null
  ).length

  if (attachmentCount !== 1) {
    throw new Error(
      'File attachment must be associated with exactly one message type'
    )
  }

  return true
} 