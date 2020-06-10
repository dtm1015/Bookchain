#include <eosio/eosio.hpp>
#include <eosio/print.hpp>
#include <eosio/asset.hpp>
#include <eosio/system.hpp>
#include <eosio/symbol.hpp>

using namespace eosio;


class [[eosio::contract("librarian")]] librarian : public 
eosio::contract{

    private:
    //Holds Books
    struct [[eosio::table]] book
    {
        uint64_t ISBN;
        uint64_t quantity;

        uint64_t primary_key() const {
            return ISBN;
        }
    };

    typedef eosio::multi_index<"books"_n, book> book_index;
    //Holds Requests
    struct [[eosio::table]] request{
        uint64_t ISBN;
        //Tokens to reward donator with
        eosio::asset Investment;

        uint64_t primary_key() const {
            return ISBN;
        }

    };

    typedef eosio::multi_index<"requests"_n, request> request_index;
    

    public:
    using contract::contract;
    //Donate a book
    [[eosio::action]]void donate(name user, uint64_t ISBN){
        //Require Auth of donator
        require_auth(user);
        //Locate book in request table with given ISBN
        request_index requests(get_self(),get_first_receiver().value);
        book_index books(get_self(),get_first_receiver().value);
        auto iterator = requests.find(ISBN);
        auto bookIterator = books.find(ISBN);
        //If book isn't found, this is a 1 Token donation
        if(iterator == requests.end()){
            //Normal Donation
            //Add Book to books table
            if(bookIterator == books.end()){
                books.emplace(user, [&]( auto& book ) {
                    book.ISBN = ISBN;
                    book.quantity = 1;

                });
            }else{
                //If it is already in the table, increase quantity
                books.modify(bookIterator, get_self(), [&](auto&book){
                    book.quantity = book.quantity + 1;
                });
            }
            
            //Define payout
            eosio::asset payout;
            symbol sym = symbol(symbol_code("BOOK"),0);
            payout.symbol = sym;
            payout.amount = 1;
            //Submit payment to user.
            action(
                permission_level{get_self(),"active"_n},
                get_self(),
                "payuser"_n,
                std::make_tuple(user, payout, std::string("Thank you for donating"))
            ).send();

        }else{
            //Fill Request
            //Add book to table
           if(bookIterator == books.end()){
                books.emplace(user, [&]( auto& book ) {
                    book.ISBN = ISBN;
                    book.quantity = 1;

                });
            }else{
                //If it is already in the table, increase quantity
                books.modify(bookIterator, get_self(), [&](auto&book){
                    book.quantity = book.quantity + 1;
                });
            }
            //Get payout from table
            eosio::asset payout = iterator->Investment;
            //Erase from table
            requests.erase(iterator);

            //Submit payment to user.
            action(
                permission_level{get_self(),"active"_n},
                get_self(),
                "payuser"_n,
                std::make_tuple(user, payout, std::string("Thank you for donating"))
            ).send();
            
        }
    }

    //Handles actions on transfer of tokens to the librarian
    //Type of action and ISBN are stored in the memo string in the format MetaCode:ISBN
    //Meta code is "re" for retrieving a book, and "sr" for submiting a request
    [[eosio::on_notify("eosio.token::transfer")]]
    void handleTransfer(name user, name to, eosio::asset investment, std::string Meta){
        //Require auth of user
        require_auth(user);
        //Ignore transfers the librarian makes to other users
        if(user == get_self()){
            return;
        }
        //Get values from meta string
        std::string ISBNString = Meta.substr(3, std::string::npos);
        std::string requestType = Meta.substr(0,2);
        std::string retrieveCode ="re";
        std::string requestCode = "sr";

        //Call action based on Meta Code
        if(requestType.compare(retrieveCode) == 0){
            action(
                permission_level{get_self(),"active"_n},
                get_self(),
                "retrieve"_n,
                std::make_tuple(user, investment, ISBNString)
            ).send();
            
        
        }else if(requestType.compare(requestCode) == 0){
            action(
                permission_level{get_self(),"active"_n},
                get_self(),
                "subreq"_n,
                std::make_tuple(user, investment, ISBNString)
            ).send();
        }else{
            //If metacode is invalid, fail
            check(false, "Invalid Meta Code");
        }
    }

    //Handles retrieving a book, called by librarian from handleTransfer
    [[eosio::action]]
    void retrieve(name user, eosio::asset investment, std::string ISBNString){
        //Only librarian may call this action
        require_auth(get_self());
        //Convert ISBN to uint64_t
            uint64_t ISBN = stoull(ISBNString);
            //Search table for book
            book_index books(get_self(),get_first_receiver().value);
            auto iterator = books.find(ISBN);
            //If book does not exist, fail
            std::string failure = "Book " +ISBNString+" does not exist.";
            check(iterator != books.end(), failure);
            //Check that book quantity > 0
            check(iterator->quantity > 0, "Out of Stock");
            books.modify(iterator, get_self(), [&](auto&book){
                    book.quantity = book.quantity - 1;
                });
        
    }


    //Erase a book from the table without exchanging tokens (Report Missing)
    [[eosio::action]]void nullify(name user, uint64_t ISBN){
        //Require auth of user
        require_auth(user);
        //Search for book in table
        book_index books(get_self(),get_first_receiver().value);
        auto iterator = books.find(ISBN);
        //Fail if book is not in the table
        check(iterator != books.end(), "Book does not exist");
        //Set Quantity to 0
        books.modify(iterator, get_self(), [&](auto&book){
                    book.quantity =0;
        });
    }

    //Handles adding and modifying requests.
    //Modifying a request is the same as adding one, the investments will be summed.
    //Called by handleTransfer
    [[eosio::action]]
    void subreq(name user, eosio::asset investment, std::string ISBNString) {
        //Only the librarian may call this action
        require_auth(get_self());
        //Convert ISBN to uint64_t
        uint64_t ISBN = stoull(ISBNString);
        //Get the Request if it exists
            request_index requests(get_self(),get_first_receiver().value);
            auto iterator = requests.find(ISBN);
        //If the request does not exist, add it
        if(iterator == requests.end()){
            requests.emplace(get_self(), [&]( auto& request ) {
                request.ISBN = ISBN;
                request.Investment = investment;
            });
        }else{
            //Else, modify the request and add the new investment to the current investment
            requests.modify(iterator, get_self(), [&](auto&request){
                request.Investment.amount = iterator->Investment.amount + investment.amount;
            });
        }
    }

    //Transfer tokens from librarian to user
    [[eosio::action]]
    void payuser(name user, eosio::asset amount, std::string memo){
        //Only librarian may call this action
        require_auth(get_self());
        //Send tokens
                action{
                permission_level{get_self(), "active"_n},
                "eosio.token"_n,
                "transfer"_n,
                std::make_tuple(get_self(), user, amount, memo)
            }.send();
    }

};