import pandas as pd
from selenium import webdriver
import csv

CHROME_DRIVER_PATH = '/Users/jiwoo/Documents/chromedriver'
FILE_PATH = 'company_namyang_products.csv'

def namyang_crawler():
    df = pd.read_csv(FILE_PATH)
    with open(FILE_PATH, 'a') as f:
        f.write('\n')

    url = 'https://company.namyangi.com/product/product.asp?cd='

    # 5:아기용, 6:커피, 21:우유, 22:발효유, 23:음료, 24:두유, 25:치즈, 26:크림/버터, 27:특수/기타
    params = 5, 6, 21, 22, 23, 24, 25, 26, 27
    i = 0

    while i < len(params):
        try:
            url = url + str(params[i])
            driver = webdriver.Chrome(CHROME_DRIVER_PATH)
            driver.get(url)

            # 제품 리스트
            product_list = driver.find_elements_by_xpath('//*[@id="id_product"]//li')
            for product in product_list:
                # 제품 리스트 내 제목만 가져옴
                product_name = product.find_element_by_tag_name('dt').text
                print(product_name)
                # dataframe -> csv 출력
                df['제품명'] = product_name
                df.to_csv(FILE_PATH, mode='a', header=False, line_terminator='\n', index=False)

            url = 'https://company.namyangi.com/product/product.asp?cd='
            i += 1

        except KeyboardInterrupt:
            driver.close()
            break


if __name__ == "__main__":
    namyang_crawler()