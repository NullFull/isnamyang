from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time


class Crawler():

    CHROMEDRIVER_PATH = "/Users/jiwoo/Documents/chromedriver"
    URL = "https://www.foodsafetykorea.go.kr/portal/specialinfo/searchInfoProduct.do?menu_grp=MENU_NEW04&menu_no=2815#"
    KEYWORD_LIST = "남양에프앤비주식회사"   # 복수 키워드 검색 가능하게. ','로 구분


    def __init__(self):
        self.driver = webdriver.Chrome(Crawler.CHROMEDRIVER_PATH)
        self.keyword_list = Crawler.KEYWORD_LIST.split(',')
        self.driver.get(Crawler.URL)
        self.page_num = 0
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
        elem = self.driver.find_element_by_id("bsn_nm")    # 업체명 input form의 id
        elem.send_keys(keyword)
        elem_search_btn = self.driver.find_element_by_id("srchBtn")    # 검색 버튼의 id
        elem_search_btn.click()

    def getPageNum(self):
        self.page_num = int(self.driver.find_elements_by_class_name("page-link")[-2].text)    # 총 페이지 수

    def clickMoreButton(self):
        self.driver.find_element_by_xpath("//*[@class='page-link next']").send_keys(Keys.ENTER)    # 다음 페이지 클릭


    def getProductName(self): # 해당 페이지에 있는 제품명을 모두 크롤링
        time.sleep(15)     # 쿼리 요청하고 데이터 받아오는 시간... 이부분은 나중에 WebDriverWait 로 수정해야할듯
        self.getPageNum()
        for i in range(0, self.page_num):
            product_list = self.driver.find_elements_by_xpath("//table[@id='tbl_prd_list']/tbody/tr")
            for product in product_list:
                product_name = product.find_elements_by_xpath("td[6]/a")[0].text
                print(product_name)
            self.clickMoreButton()
            time.sleep(10)



crawler = Crawler()