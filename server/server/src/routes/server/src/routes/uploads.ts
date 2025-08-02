import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getConnection } from 'typeorm';
import type { IssueAttachment } from '../entities/IssueAttachment';
import type { Issue } from '../entities/Issue';
import type { AuthRequest } from '../utils/auth'; // if using custom Auth middleware
import { BadRequestError, NotFoundError } from '../utils/errors';

const router = Router();

const MAX_UPLOAD_COUNT = 35;

/**
 * GET /api/uploads
 * Query:
 *   count=<number>             // how many URLs to issue, max 35
 *   issueId=<number> (optional) // attach these keys to an existing issue
 *
 *                     OR
 *
 * POST /api/uploads
 * Body (JSON): {
 *   count: number,
 *   issueId?: number,
 *   fileNames?: string[],        // optional friendly base names
 *   contentTypes?: string[],     // optional, must match fileNames length
 * }
 *
 * Response:
 * {
 *   expiresIn: number,
 *   upload: { fileName: string, key: string, url: string }[]
 * }
 */
router.all(
  ['GET', 'POST'],
  async (req: AuthRequest, res, next) => {
    try {
      const isJSON = req.is('application/json');
      // parse input similarly
      const body = isJSON ? req.body : req.query;
      const count =
        typeof body.count === 'string' ? parseInt(body.count) : body.count;
      const issueId = body.issueId
        ? parseInt(`${body.issueId}`)
        : undefined;

      if (!count || count < 1 || count > MAX_UPLOAD_COUNT) {
        throw new BadRequestError(
          `count is required (1–${MAX_UPLOAD_COUNT}), got: ${body.count}`
        );
      }
      const fileNames: string[] | undefined = body.fileNames;
      const contentTypes: string[] | undefined = body.contentTypes;

      if (fileNames && fileNames.length !== count) {
        throw new BadRequestError(
          'fileNames length must equal count'
        );
      }
      if (contentTypes && contentTypes.length !== count) {
        throw new BadRequestError(
          'contentTypes length must equal count'
        );
      }

      let issue: Issue | undefined;
      if (issueId !== undefined) {
        issue = await getConnection()
          .getRepository(Issue)
          .findOne(issueId);
        if (!issue) {
          throw new NotFoundError(`Issue ${issueId} not found`);
        }
        // You might also check authorization to attach
      }

      // Initialize S3 client using credentials from server/src/tconfig.json
      const { AWS_REGION, S3_BUCKET } = require('../tconfig.json');
      const s3 = new S3Client({ region: AWS_REGION });

      const expiresIn = 15 * 60; // URLs valid for 15 min
      const upload: {
        fileName: string;
        key: string;
        url: string;
      }[] = [];

      for (let i = 0; i < count; i++) {
        const baseName = fileNames?.[i] || `upload`;
        const ext = contentTypes
          ? contentTypes[i].split('/')[1] || 'bin'
          : 'bin';
        const key = issue
          ? `issues/${issue.id}/${Date.now()}-${uuidv4()}.${ext}`
          : `anon

        