__author__ = '@oscarmarinmiro @ @outliers_es'

import pprint
import copy

# REFERENCES
# https://www.cs.bu.edu/teaching/c/tree/breadth-first/

class BeginTree:
    def __init__(self):
        # Init the root node
        self.tree = {}
        self.tree["root"] = {'children': {}, 'count': 0}

    def recalculate_counts(self):

        def go_down_count(name, node):

            if len(node['children']) > 0:
                node['count'] = 0

                for child_name, content in node['children'].items():
                    node['count']+= go_down_count(child_name, content)

                return node['count']
            else:
                return node['count']

        my_node = self.tree['root']

        go_down_count("root", my_node)

        return


    def join_lonelies(self):
        def go_down(name,node,parent):

            # if node has only one children
            if len(node['children'].keys()) == 1:

                # print "======"
                # print "LONELY"
                # pprint.pprint(node)
                # loop until end o more than one children

                first_node = node
                now_node = node
                last_node = node
                count = 0
                names = [name]

                while(len(now_node['children'].keys()) == 1):

                    # Append lonely node name
                    names.append(now_node['children'].keys()[0])

                    now_node = now_node['children'][now_node['children'].keys()[0]]

                    # print "LONELY"
                    # pprint.pprint(node)

                    last_node = now_node
                    count= now_node['count']

                first_node['count'] = count
                first_node['children'] = last_node['children']

                # print "Adding with"
                # pprint.pprint(first_node)
                # pprint.pprint(names)
                # pprint.pprint(count)

                parent['children']["  ".join(names)] = copy.deepcopy(first_node)

                del(parent['children'][name])

                node = first_node

                if len(node['children']) > 0:
                    for child_name, content in node['children'].items():
                        go_down(child_name, content, node)
            else:
                if len(node['children']) > 0:
                    for child_name, content in node['children'].items():
                        go_down(child_name, content, node)


        # Visit the tree twice, so first 'join' does not leave loose ends...

        go_down("root", self.tree['root'], self.tree)

        self.recalculate_counts()

        go_down("root", self.tree['root'], self.tree)

        self.recalculate_counts()

    def remove_lonely_ends(self):

        def go_down(name, node, parent):
            if len(node['children'].keys()) == 1 and '__END__' in node['children']:
                print "SOLITARIO"
                del(node['children']['__END__'])
            else:
                if len(node['children']) > 0:
                    for child_name, content in node['children'].items():
                        go_down(child_name, content, node)
            return

        go_down("root", self.tree['root'], self.tree)

        self.recalculate_counts()




    def prune(self, min_count):

        def go_down(name, node, parent):

            if node['count'] < min_count:
                # print "Quitando %s de %s" % (name, pprint.pformat(parent))
                del(parent['children'][name])
            else:
                if len(node['children']) > 0:
                    for child_name, content in node['children'].items():
                        go_down(child_name, content, node)
            return

        go_down("root", self.tree['root'], self.tree)

        self.recalculate_counts()

    def insert_node_simple(self, path_vector, count):

        last = path_vector[-1]

        parents = path_vector[:-1]

        current_node = self.tree["root"]

        current_node['count'] += count

        for parent in parents:
            if parent not in current_node['children']:
                current_node['children'][parent] = {'children': {}, "count": 0}
            current_node['children'][parent]['count'] += count

            current_node = current_node['children'][parent]

        # Last node from parents is our node

        if last not in current_node['children']:
            current_node['children'][last] = {'children': {'__END__':{'children':{}, 'count': 0}}, 'count':0}

        current_node['children'][last]['count'] += count

        if "__END__" not in current_node['children'][last]['children']:
            current_node['children'][last]['children']['__END__'] = {'children': {}, 'count': 0}

        current_node['children'][last]['children']['__END__']['count'] += count


    def insert_node(self, path_vector, count, suffix):

        if suffix:
            print "==========="
            print "SECUENCIA ORIGINAL"
            pprint.pprint(path_vector)
            for i in range(0, len(path_vector)):
                path = [path_vector[j] for j in range(i,len(path_vector))]
                print "SECUENCIA DERIVADA"
                pprint.pprint(path)
                self.insert_node_simple(path,count)
        else:
            self.insert_node_simple(path_vector,count)

    def show_tree(self):
        pprint.pprint(self.tree)

    def get_tree_stats(self):

        depth_struct = {}

        def go_down_count(name, node, depth):

            if depth not in depth_struct:
                depth_struct[depth] = 0

            depth_struct[depth]+=1

            if len(node['children']) > 0:

                for child_name, content in node['children'].items():
                    go_down_count(child_name, content, depth+1)


        my_node = self.tree['root']

        go_down_count("root", my_node, 0)

        node_number = 0

        for index in depth_struct.keys():
            node_number += depth_struct[index]

        return depth_struct, node_number


    def tree_to_d3(self):

        def go_down(name, node):
            d3_node = {}

            if 'count' in node:
                d3_node['size'] = node['count']

            d3_node['name'] = name
            d3_node['children'] = []

            if len(node['children']) > 0:
                # del(d3_node['size'])
                for child_name, content in node['children'].items():
                    d3_node['children'].append(go_down(child_name, content))
                return d3_node
            else:
                del(d3_node['children'])
                return d3_node

        my_node = self.tree['root']

        my_struct = go_down("root", my_node)

        return my_struct

def main():

    print "Instantiating..."

    my_tree = BeginTree()

    print "Inserting..."

    # my_tree.insert_node(["A"], 10)
    # my_tree.insert_node(["A","B"], 4)
    # my_tree.insert_node(["A","B","C"], 4)
    my_tree.insert_node(["A","B","C","D"], 4, True)
    my_tree.insert_node(["B","A"], 4, True)

    print "Printing..."

    my_tree.show_tree()

    print "Converting..."

    d3_tree = my_tree.tree_to_d3()

    pprint.pprint(d3_tree)

    print "Removing lonely ends"

    my_tree.remove_lonely_ends()

    my_tree.show_tree()

    # print "Pruning and lonely ends..."
    #
    # my_tree.prune(5)
    #
    # my_tree.show_tree()
    #
    # my_tree.remove_lonely_ends()
    #
    # my_tree.show_tree()

    print "JOining lonelies..."

    my_tree.join_lonelies()

    my_tree.show_tree()

    print "Converting..."

    pprint.pprint(my_tree.tree_to_d3())

    print "Stats..."

    pprint.pprint(my_tree.get_tree_stats())

if __name__ == "__main__":
    main()



