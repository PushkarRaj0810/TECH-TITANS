import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Issue } from '../entities/Issue';
import { IssueCategory } from '../entities/IssueCategory'; // assuming a separate entity for categories
import { IssueAttachment } from '../entities/IssueAttachment';

const router = Router();

/**
 * GET /api/open311/services
 * Returns a list of available issue categories (Open311 format)
 */
router.get('/services', async (_req, res) => {
  const categories = await getRepository(IssueCategory).find();
  const services = categories.map(category => ({
    service_code: category.id.toString(),
    service_name: category.name,
    description: category.description || '',
    metadata: false,
    type: 'realtime',
    keywords: category.keywords || '',
    group: null,
  }));
  res.json(services);
});

/**
 * GET /api/open311/requests
 * Query: status= (optional), service_code= (optional), lat/lon/radius (optional)
 */
router.get('/requests', async (req, res) => {
  const repo = getRepository(Issue);

  const qb = repo
    .createQueryBuilder('issue')
    .leftJoinAndSelect('issue.attachments', 'attachment')
    .leftJoinAndSelect('issue.category', 'category');

  if (req.query.status) {
    qb.andWhere('issue.status = :status', { status: req.query.status });
  }

  if (req.query.service_code) {
    qb.andWhere('category.id = :catId', {
      catId: req.query.service_code,
    });
  }

  if (req.query.lat && req.query.lon && req.query.radius) {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const radius = parseFloat(req.query.radius as string);

    // Basic Haversine approximation (not perfect, but close for small distances)
    qb.andWhere(`
      earth_distance(ll_to_earth(:lat, :lon), ll_to_earth(issue.latitude, issue.longitude)) < :radius
    `, { lat, lon, radius: radius * 1000 }); // convert km to meters
  }

  const issues = await qb.getMany();

  const results = issues.map(issue => ({
    service_request_id: issue.id.toString(),
    status: issue.status,
    service_name: issue.category.name,
    service_code: issue.category.id.toString(),
    description: issue.description,
    requested_datetime: issue.createdAt.toISOString(),
    updated_datetime: issue.updatedAt.toISOString(),
    address: issue.locationDescription,
    lat: issue.latitude,
    long: issue.longitude,
    media_url: issue.attachments?.[0]
      ? `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${issue.attachments[0].objectKey}`
      : null,
  }));

  res.json(results);
});

/**
 * GET /api/open311/requests/:id
 * Fetch a single service request by ID
 */
router.get('/requests/:id', async (req, res) => {
  const issue = await getRepository(Issue).findOne(req.params.id, {
    relations: ['category', 'attachments'],
  });

  if (!issue) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const result = {
    service_request_id: issue.id.toString(),
    status: issue.status,
    service_name: issue.category.name,
    service_code: issue.category.id.toString(),
    description: issue.description,
    requested_datetime: issue.createdAt.toISOString(),
    updated_datetime: issue.updatedAt.toISOString(),
    address: issue.locationDescription,
    lat: issue.latitude,
    long: issue.longitude,
    media_url: issue.attachments?.[0]
      ? `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${issue.attachments[0].objectKey}`
      : null,
  };

  res.json(result);
});

export default router;
