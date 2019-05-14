import pandas as pd
from selenium import webdriver
import csv

CHROME_DRIVER_PATH = '/Users/jiwoo/Documents/chromedriver'
FILE_PATH = 'products.csv'

def crawler(keyword):
    url = 'http://www.lottemart.com/search/search.do?searchTerm='
    url = url + keyword
    driver = webdriver.Chrome(CHROME_DRIVER_PATH)
    driver.get(url)
    df = pd.read_csv(FILE_PATH)
    with open(FILE_PATH, 'a') as f:
        f.write('\n')

    while(1):
        try:
            product_list = driver.find_elements_by_xpath('//*[@class="product-article"][@data-panel="product"]/div/a')
            for product in product_list:
                product_code = product.get_attribute("data-prod-cd")
                product_name = product.find_element_by_xpath('.//img').get_attribute("alt")
                print(product_name, product_code)
                df['바코드'] = product_code
                df['제품명'] = product_name
                df.to_csv(FILE_PATH, mode='a', header=False, line_terminator='\n', index=False)

            # 다음 페이지 클릭
            next_btn = driver.find_element_by_xpath('//a[@class="page-next"]')
            next_btn.send_keys("\n")    # 버튼에 엔터 전송

        except Exception:
            break
            driver.close()
        except KeyboardInterrupt:
            break
            driver.close()


if __name__ == "__main__":
    crawler("남양")