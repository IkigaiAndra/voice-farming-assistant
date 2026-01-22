/**
 * Data Processor Function
 * Processes uploaded images for crop analysis
 */

import AWS from 'aws-sdk';
import sharp from 'sharp';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();

const CROP_TABLE = process.env.DYNAMODB_TABLE?.replace('farmer-profiles', 'crop-data');

export const handler = async (event) => {
  console.log('Data processor event:', JSON.stringify(event, null, 2));

  try {
    // Get S3 event details
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing image: s3://${bucket}/${key}`);

    // Analyze image
    const analysis = await analyzeImage(bucket, key);

    // Store results
    await storeAnalysisResults(key, analysis);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Image processed successfully',
        analysis
      })
    };

  } catch (error) {
    console.error('Error processing image:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing image',
        error: error.message
      })
    };
  }
};

/**
 * Analyze image using Rekognition
 */
async function analyzeImage(bucket, key) {
  try {
    // Detect objects and labels
    const labels = await rekognition.detectLabels({
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: key
        }
      },
      MaxLabels: 20,
      MinConfidence: 70
    }).promise();

    // Detect text (for farmer notes)
    const text = await rekognition.detectText({
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: key
        }
      }
    }).promise();

    return {
      labels: labels.Labels || [],
      detectedText: text.TextDetections || [],
      timestamp: new Date().toISOString(),
      imageKey: key
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

/**
 * Store analysis results in DynamoDB
 */
async function storeAnalysisResults(imageKey, analysis) {
  // Extract farmer ID from key (format: farmer_id/timestamp_filename)
  const farmerId = imageKey.split('/')[0];
  const timestamp = Date.now();

  // Detect crop type from labels
  const cropType = detectCropType(analysis.labels);

  // Detect potential issues
  const issues = detectIssues(analysis.labels);

  const params = {
    TableName: CROP_TABLE,
    Item: {
      cropId: `${farmerId}_${cropType}`,
      timestamp,
      farmerId,
      cropType,
      imageKey,
      analysis: {
        labels: analysis.labels.map(l => ({
          name: l.Name,
          confidence: l.Confidence
        })),
        detectedIssues: issues,
        detectionTimestamp: analysis.timestamp
      },
      processed: true
    }
  };

  try {
    await dynamodb.put(params).promise();
    console.log(`Stored analysis for crop: ${cropType}`);
  } catch (error) {
    console.error('Error storing analysis:', error);
    throw error;
  }
}

/**
 * Detect crop type from labels
 */
function detectCropType(labels) {
  const cropKeywords = {
    'wheat': ['wheat', 'cereal', 'grain'],
    'rice': ['rice', 'paddy'],
    'cotton': ['cotton', 'boll'],
    'tomato': ['tomato', 'vegetable', 'fruit'],
    'potato': ['potato', 'tuber'],
    'chili': ['chili', 'pepper', 'spice'],
    'onion': ['onion', 'bulb'],
    'garlic': ['garlic', 'bulb'],
    'sugarcane': ['sugarcane', 'tall grass'],
    'corn': ['corn', 'maize', 'grain']
  };

  const detectedLabels = labels.map(l => l.Name.toLowerCase());

  for (const [crop, keywords] of Object.entries(cropKeywords)) {
    for (const keyword of keywords) {
      if (detectedLabels.some(label => label.includes(keyword))) {
        return crop;
      }
    }
  }

  return 'unknown_crop';
}

/**
 * Detect potential agricultural issues
 */
function detectIssues(labels) {
  const issueKeywords = {
    'pest_damage': ['pest', 'insect', 'beetle', 'worm', 'aphid', 'caterpillar'],
    'disease': ['blight', 'rot', 'mildew', 'fungal', 'bacterial', 'rust', 'leaf spot'],
    'nutrient_deficiency': ['yellowing', 'chlorosis', 'pale', 'wilting'],
    'water_stress': ['wilting', 'dry', 'brown leaves', 'drooping'],
    'weed_presence': ['weed', 'grass', 'unwanted plant'],
    'good_health': ['green', 'healthy', 'vigorous', 'blooming']
  };

  const detectedLabels = labels.map(l => l.Name.toLowerCase());
  const issues = [];

  for (const [issue, keywords] of Object.entries(issueKeywords)) {
    for (const keyword of keywords) {
      if (detectedLabels.some(label => label.includes(keyword))) {
        issues.push(issue);
        break;
      }
    }
  }

  return issues.length > 0 ? issues : ['observation_captured'];
}
