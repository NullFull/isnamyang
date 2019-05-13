import csv
from os import path

from django.conf import settings
from django.http import JsonResponse, Http404


csv_path = path.join(settings.DATA_DIR, 'products.csv')
reader = csv.reader(open(csv_path, 'r'))
next(reader)

products = {}
for row in reader:
    products[row[0]] = {
        '바코드': row[0],
        '브랜드': row[1],
        '제조사': row[2],
        '유통사': row[3],
        '제품명': row[4],
    }


def isnamyang(request):
    barcode = request.GET.get('barcode')

    if barcode not in products:
        raise Http404

    return JsonResponse(products[barcode])
