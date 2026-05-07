"""
Yam Leaf Disease Detector API Tests
Tests for /api/model/info, /api/predict, /api/predictions endpoints
"""
import pytest
import requests
import os
from PIL import Image
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Expected class names
EXPECTED_CLASSES = ['Healthy', 'Anthracnose', 'Virus Infected']


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def test_image_bytes():
    """Generate a test leaf-like image (green color)"""
    img = Image.new('RGB', (300, 300), (60, 130, 70))  # Green leaf-like color
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    return buffer.getvalue()


@pytest.fixture(scope="module")
def test_image_file(test_image_bytes):
    """Save test image to temp file"""
    path = '/tmp/test_leaf.jpg'
    with open(path, 'wb') as f:
        f.write(test_image_bytes)
    return path


class TestModelInfo:
    """Tests for GET /api/model/info endpoint"""
    
    def test_model_info_returns_200(self, api_client):
        """Model info endpoint should return 200"""
        response = api_client.get(f"{BASE_URL}/api/model/info")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/model/info returned 200")
    
    def test_model_info_has_model_version(self, api_client):
        """Model info should include model_version"""
        response = api_client.get(f"{BASE_URL}/api/model/info")
        data = response.json()
        assert "model_version" in data, "Missing model_version field"
        assert isinstance(data["model_version"], str), "model_version should be string"
        assert len(data["model_version"]) > 0, "model_version should not be empty"
        print(f"✓ model_version: {data['model_version']}")
    
    def test_model_info_has_class_names(self, api_client):
        """Model info should include class_names with 3 expected classes"""
        response = api_client.get(f"{BASE_URL}/api/model/info")
        data = response.json()
        assert "class_names" in data, "Missing class_names field"
        assert data["class_names"] == EXPECTED_CLASSES, f"Expected {EXPECTED_CLASSES}, got {data['class_names']}"
        print(f"✓ class_names: {data['class_names']}")
    
    def test_model_info_has_class_precision(self, api_client):
        """Model info should include class_precision dict for all classes"""
        response = api_client.get(f"{BASE_URL}/api/model/info")
        data = response.json()
        assert "class_precision" in data, "Missing class_precision field"
        precision = data["class_precision"]
        for cls in EXPECTED_CLASSES:
            assert cls in precision, f"Missing precision for class: {cls}"
            assert isinstance(precision[cls], (int, float)), f"Precision for {cls} should be numeric"
        print(f"✓ class_precision: {precision}")
    
    def test_model_info_has_input_size(self, api_client):
        """Model info should include input_size [224, 224, 3]"""
        response = api_client.get(f"{BASE_URL}/api/model/info")
        data = response.json()
        assert "input_size" in data, "Missing input_size field"
        assert data["input_size"] == [224, 224, 3], f"Expected [224, 224, 3], got {data['input_size']}"
        print(f"✓ input_size: {data['input_size']}")


class TestPredictEndpoint:
    """Tests for POST /api/predict endpoint"""
    
    def test_predict_with_valid_image_returns_200(self, test_image_file):
        """Predict endpoint should return 200 with valid image"""
        with open(test_image_file, 'rb') as f:
            files = {'file': ('leaf.jpg', f, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/api/predict", files=files)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"✓ POST /api/predict returned 200")
    
    def test_predict_returns_all_required_fields(self, test_image_file):
        """Predict response should contain all required fields"""
        with open(test_image_file, 'rb') as f:
            files = {'file': ('leaf.jpg', f, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/api/predict", files=files)
        
        data = response.json()
        required_fields = [
            'id', 'predicted_class', 'status_color', 'confidence', 'precision',
            'severity', 'leaf_health_score', 'description', 'recommendation',
            'probabilities', 'bounding_box', 'model_version', 'inferred_at'
        ]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        print(f"✓ All required fields present: {list(data.keys())}")
    
    def test_predict_class_is_valid(self, test_image_file):
        """predicted_class must be one of the 3 valid classes"""
        with open(test_image_file, 'rb') as f:
            files = {'file': ('leaf.jpg', f, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/api/predict", files=files)
        
        data = response.json()
        assert data['predicted_class'] in EXPECTED_CLASSES, \
            f"Invalid predicted_class: {data['predicted_class']}, expected one of {EXPECTED_CLASSES}"
        print(f"✓ predicted_class: {data['predicted_class']}")
    
    def test_predict_confidence_range(self, test_image_file):
        """confidence should be between 0-100"""
        with open(test_image_file, 'rb') as f:
            files = {'file': ('leaf.jpg', f, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/api/predict", files=files)
        
        data = response.json()
        assert 0 <= data['confidence'] <= 100, f"Confidence {data['confidence']} out of range [0, 100]"
        print(f"✓ confidence: {data['confidence']}%")
    
    def test_predict_confidence_matches_max_probability(self, test_image_file):
        """confidence should match max(probabilities) * 100"""
        with open(test_image_file, 'rb') as f:
            files = {'file': ('leaf.jpg', f, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/api/predict", files=files)
        
        data = response.json()
        max_prob = max(data['probabilities'].values()) * 100
        # Allow small floating point tolerance
        assert abs(data['confidence'] - max_prob) < 0.2, \
            f"Confidence {data['confidence']} doesn't match max probability {max_prob}"
        print(f"✓ confidence {data['confidence']} matches max probability {max_prob:.1f}")
    
    def test_predict_probabilities_structure(self, test_image_file):
        """probabilities dict should contain exactly 3 class names"""
        with open(test_image_file, 'rb') as f:
            files = {'file': ('leaf.jpg', f, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/api/predict", files=files)
        
        data = response.json()
        probs = data['probabilities']
        assert set(probs.keys()) == set(EXPECTED_CLASSES), \
            f"Probabilities keys {list(probs.keys())} don't match expected {EXPECTED_CLASSES}"
        print(f"✓ probabilities keys: {list(probs.keys())}")
    
    def test_predict_probabilities_sum_to_one(self, test_image_file):
        """probabilities should sum to approximately 1.0"""
        with open(test_image_file, 'rb') as f:
            files = {'file': ('leaf.jpg', f, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/api/predict", files=files)
        
        data = response.json()
        prob_sum = sum(data['probabilities'].values())
        assert 0.99 <= prob_sum <= 1.01, f"Probabilities sum to {prob_sum}, expected ~1.0"
        print(f"✓ probabilities sum: {prob_sum:.4f}")
    
    def test_predict_status_color_valid(self, test_image_file):
        """status_color should be emerald, amber, or rose"""
        with open(test_image_file, 'rb') as f:
            files = {'file': ('leaf.jpg', f, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/api/predict", files=files)
        
        data = response.json()
        valid_colors = ['emerald', 'amber', 'rose']
        assert data['status_color'] in valid_colors, \
            f"Invalid status_color: {data['status_color']}, expected one of {valid_colors}"
        print(f"✓ status_color: {data['status_color']}")
    
    def test_predict_severity_range(self, test_image_file):
        """severity should be between 0-100"""
        with open(test_image_file, 'rb') as f:
            files = {'file': ('leaf.jpg', f, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/api/predict", files=files)
        
        data = response.json()
        assert 0 <= data['severity'] <= 100, f"Severity {data['severity']} out of range [0, 100]"
        print(f"✓ severity: {data['severity']}%")
    
    def test_predict_leaf_health_score_range(self, test_image_file):
        """leaf_health_score should be between 0-100"""
        with open(test_image_file, 'rb') as f:
            files = {'file': ('leaf.jpg', f, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/api/predict", files=files)
        
        data = response.json()
        assert 0 <= data['leaf_health_score'] <= 100, \
            f"leaf_health_score {data['leaf_health_score']} out of range [0, 100]"
        print(f"✓ leaf_health_score: {data['leaf_health_score']}%")
    
    def test_predict_has_description_and_recommendation(self, test_image_file):
        """description and recommendation should be non-empty strings"""
        with open(test_image_file, 'rb') as f:
            files = {'file': ('leaf.jpg', f, 'image/jpeg')}
            response = requests.post(f"{BASE_URL}/api/predict", files=files)
        
        data = response.json()
        assert isinstance(data['description'], str) and len(data['description']) > 0, \
            "description should be non-empty string"
        assert isinstance(data['recommendation'], str) and len(data['recommendation']) > 0, \
            "recommendation should be non-empty string"
        print(f"✓ description length: {len(data['description'])} chars")
        print(f"✓ recommendation length: {len(data['recommendation'])} chars")


class TestPredictErrorHandling:
    """Tests for error handling in /api/predict"""
    
    def test_predict_rejects_non_image_file(self):
        """Predict should return 400 for non-image files"""
        # Create a text file
        files = {'file': ('test.txt', b'This is not an image', 'text/plain')}
        response = requests.post(f"{BASE_URL}/api/predict", files=files)
        assert response.status_code == 400, f"Expected 400 for non-image, got {response.status_code}"
        print(f"✓ Non-image file rejected with 400")
    
    def test_predict_rejects_empty_file(self):
        """Predict should return 400 for empty files"""
        files = {'file': ('empty.jpg', b'', 'image/jpeg')}
        response = requests.post(f"{BASE_URL}/api/predict", files=files)
        assert response.status_code == 400, f"Expected 400 for empty file, got {response.status_code}"
        print(f"✓ Empty file rejected with 400")
    
    def test_predict_handles_malformed_image(self):
        """Predict should handle malformed image gracefully"""
        # Send random bytes as image
        files = {'file': ('bad.jpg', b'not a valid jpeg content', 'image/jpeg')}
        response = requests.post(f"{BASE_URL}/api/predict", files=files)
        # Should return 500 with clean error message (not crash)
        assert response.status_code in [400, 500], \
            f"Expected 400 or 500 for malformed image, got {response.status_code}"
        print(f"✓ Malformed image handled with status {response.status_code}")


class TestPredictionsHistory:
    """Tests for GET /api/predictions endpoint"""
    
    def test_predictions_returns_200(self, api_client):
        """Predictions history endpoint should return 200"""
        response = api_client.get(f"{BASE_URL}/api/predictions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/predictions returned 200")
    
    def test_predictions_returns_list(self, api_client):
        """Predictions should return a list"""
        response = api_client.get(f"{BASE_URL}/api/predictions")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ Predictions returned list with {len(data)} items")
    
    def test_predictions_no_mongodb_id_exposed(self, api_client):
        """Predictions should not expose MongoDB _id field"""
        response = api_client.get(f"{BASE_URL}/api/predictions")
        data = response.json()
        for item in data:
            assert '_id' not in item, f"MongoDB _id field should not be exposed: {item.keys()}"
        print(f"✓ No _id field exposed in predictions")


class TestRootEndpoint:
    """Tests for GET /api/ root endpoint"""
    
    def test_root_returns_200(self, api_client):
        """Root endpoint should return 200"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/ returned 200")
    
    def test_root_returns_message(self, api_client):
        """Root endpoint should return welcome message"""
        response = api_client.get(f"{BASE_URL}/api/")
        data = response.json()
        assert "message" in data, "Missing message field"
        assert "Yam Leaf" in data["message"], f"Unexpected message: {data['message']}"
        print(f"✓ Root message: {data['message']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
