# 🧪 TESTING.md — Django & DRF

## 📌 Overview

This project supports testing using:

- Django’s built-in test runner (`manage.py test`)
- pytest (recommended)

Works for both Django apps and Django REST Framework (DRF) APIs.

---

## ⚙️ Setup

### Install dependencies

```powershell
pip install pytest pytest-django
```

Optional (for API testing):

```powershell
pip install djangorestframework
```

---

## ⚙️ pytest Configuration

Create a `pytest.ini` file in the project root:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = myproject.settings
python_files = tests.py test_*.py *_tests.py
```

---

## 🧪 Writing Tests

### Model Test (pytest)

```python
import pytest
from app.models import MyModel

@pytest.mark.django_db
def test_model_creation():
    obj = MyModel.objects.create(name="Test")
    assert obj.name == "Test"
```

---

### View Test (pytest)

```python
@pytest.mark.django_db
def test_home_view(client):
    response = client.get("/")
    assert response.status_code == 200
```

---

### DRF API Test

```python
import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_api_list():
    client = APIClient()
    response = client.get("/api/items/")
    assert response.status_code == 200
```

---

### Django TestCase Example

```python
from django.test import TestCase
from app.models import MyModel

class MyModelTest(TestCase):
    def test_creation(self):
        obj = MyModel.objects.create(name="Hello")
        self.assertEqual(obj.name, "Hello")
```

---

## ▶️ Running Tests

### Using pytest (recommended)

```powershell
pytest
```

Run a specific file:

```powershell
pytest app/tests/test_models.py
```

Verbose output:

```powershell
pytest -v
```

---

### Using Django test runner

```powershell
python manage.py test
```

Run specific app:

```powershell
python manage.py test app
```

---

## 🧰 Useful pytest Features

Run in parallel:

```powershell
pip install pytest-xdist
pytest -n auto
```

Show print output:

```powershell
pytest -s
```

Stop on first failure:

```powershell
pytest -x
```

---

## 🧪 Fixtures (pytest)

```python
import pytest
from app.models import MyModel

@pytest.fixture
def sample_model():
    return MyModel.objects.create(name="Fixture")
```

Usage:

```python
def test_fixture(sample_model):
    assert sample_model.name == "Fixture"
```

---

## 🧼 Best Practices

- Keep tests inside a `tests/` folder per app
- Use `test_*.py` naming
- Use fixtures to reduce duplication
- Test both success and failure cases
- Separate unit and integration tests

---
