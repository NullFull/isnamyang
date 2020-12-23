from django.http import JsonResponse
from django.test import TestCase


class ApiTest(TestCase):
    def test_namyang(self):
        response = self.client.get('/api/isnamyang?barcode=8801069173603')

        self.assertEqual(type(response), JsonResponse)
        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertTrue('바코드' in data)
        self.assertEqual(data['바코드'], '8801069173603')

    def test_not_namyang(self):
        response = self.client.get('/api/isnamyang?barcode=12341234')

        self.assertEqual(response.status_code, 404)
