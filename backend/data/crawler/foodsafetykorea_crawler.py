from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import pandas as pd

class Crawler():

    CHROMEDRIVER_PATH = "/Users/jiwoo/Documents/chromedriver"
    URL = "https://www.foodsafetykorea.go.kr/portal/specialinfo/searchInfoProduct.do?menu_grp=MENU_NEW04&menu_no=2815#"
    KEYWORD_LIST = "남양에프앤비주식회사"
    FILE_PATH = './foodkorea_namyang_products.csv'

    def __init__(self):
        self.driver = webdriver.Chrome(Crawler.CHROMEDRIVER_PATH)
        self.keyword_list = Crawler.KEYWORD_LIST.split(',')
        self.current_keyword = ''
        self.driver.get(Crawler.URL)
        self.page_num = 0
        with open(Crawler.FILE_PATH, 'a') as f:
            f.write('\n')

        """
        # csv 생성
        self.header = ['바코드', '브랜드', '제조사', '유통사', '제품명', '품목보고번호']
        self.empty_row = ['','','','','']
        self.csvfile = open(Crawler.FILE_PATH, "w", encoding='utf-8')
        self.writer = csv.writer(self.csvfile, delimiter=',')
        self.writer.writerow(self.header)
        """

        self.df = pd.read_csv(Crawler.FILE_PATH, encoding='utf-8')
        self.startCrawling()    # start crawling


    def startCrawling(self):
        count = len(self.keyword_list)
        for _ in range(count):
            if len(self.keyword_list) != 0:
                self.searchKeyword()
                self.getProductName()
            else:
                self.driver.quit() # quit all browser. close()는 하나만 종료
                return


    def searchKeyword(self):
        keyword = self.keyword_list.pop()
        self.current_keyword = keyword
        elem = self.driver.find_element_by_id("bsn_nm")    # 업체명 input form의 id
        elem.send_keys(keyword)
        elem_search_btn = self.driver.find_element_by_id("srchBtn")    # 검색 버튼의 id
        elem_search_btn.click()

    def getPageNum(self):
        self.page_num = int(self.driver.find_elements_by_class_name("page-link")[-2].text)    # 총 페이지 수

    def clickMoreButton(self):
        self.driver.find_element_by_xpath("//*[@class='page-link next']").send_keys(Keys.ENTER)    # 다음 페이지 클릭
        element = EC.presence_of_element_located((By.XPATH, "//*[@id='fancybox-loading']"))
        WebDriverWait(self.driver, 60).until_not(element)    # 페이지 로딩 휠이 사라질 때까지 대기... 내 인터넷이 느린가?


    def getProductName(self): # 해당 페이지에 있는 제품명을 모두 크롤링
        try:
            # 최초 검색시 기다리는 로딩 시간
            element = EC.presence_of_element_located((By.XPATH,"//*[@id='div_totCnt' and not(contains(text(), '조회중'))]"))
            WebDriverWait(self.driver, 20).until(element)
            self.getPageNum()
            for i in range(0, self.page_num):
                product_list = self.driver.find_elements_by_xpath("//table[@id='tbl_prd_list']/tbody/tr")
                for product in product_list:
                    product_name = product.find_elements_by_xpath("td[6]/a")[0].text
                    notification_num = product.find_elements_by_xpath("td[2]")[0].text
                    print(self.current_keyword, product_name, notification_num)
                    self.df['제조사'] = self.current_keyword
                    self.df['제품명'] = product_name
                    self.df['품목보고번호'] = notification_num
                    self.df.to_csv(Crawler.FILE_PATH, mode='a', header=False, line_terminator='\n', index=False)
                if i == self.page_num-1:
                    print(">>> Finally reached the last page >>>")
                    self.driver.quit()
                else:
                    self.clickMoreButton()

        except TimeoutException:
            print("Time out!")
            self.driver.quit()



crawler = Crawler()